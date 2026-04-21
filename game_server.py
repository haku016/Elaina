"""
Story Game Server – Real-time multiplayer RPG for 2 players.
Gemini acts as Game Master, two players share one adventure.

Setup .env:
  GEMINI_API_KEY=...
  PLAYER1_NAME=Joshua   PLAYER1_PIN=1111
  PLAYER2_NAME=Elaina   PLAYER2_PIN=2222
  GAME_PORT=5050

Run: python game_server.py
Share the WiFi URL printed at startup with your partner.
"""

import os, sys, json, re, socket, threading, urllib.request, urllib.error
from datetime import datetime

# ── .env loader (no external dep needed) ─────────────────────────────────────
_base = os.path.dirname(os.path.abspath(__file__))
_env  = os.path.join(_base, '.env')

def _load_env(path):
    if not os.path.isfile(path): return
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k, _, v = line.partition('=')
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env(_env)
try:
    from dotenv import load_dotenv; load_dotenv(_env, override=True)
except ImportError: pass

# ── Flask + SocketIO ──────────────────────────────────────────────────────────
from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__, template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'storymaster-elaina-2025-secret')
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='threading')

# ── Player config ─────────────────────────────────────────────────────────────
PLAYERS = {
    os.environ.get('PLAYER1_NAME', 'Joshua').lower(): {
        'display': os.environ.get('PLAYER1_NAME', 'Joshua'),
        'pin':     os.environ.get('PLAYER1_PIN', '1111'),
        'icon':    '⚔️',
    },
    os.environ.get('PLAYER2_NAME', 'Elaina').lower(): {
        'display': os.environ.get('PLAYER2_NAME', 'Elaina'),
        'pin':     os.environ.get('PLAYER2_PIN', '2222'),
        'icon':    '🌸',
    },
}

# ── Game state (in-memory, shared by all connections) ────────────────────────
def fresh_char(name):
    return dict(name=name, hp=20, maxHp=20, mp=20, maxMp=20,
                level=1, gold=0, items=[], status='Bình thường', location='Khởi đầu')

state = {
    'chars':   {k: fresh_char(v['display']) for k, v in PLAYERS.items()},
    'online':  {},      # sid → display name
    'history': [],      # [{type, sender, text, ts}, ...]
    'active':  False,
}

# ── Gemini AI (Game Master) ───────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_URL = ('https://generativelanguage.googleapis.com/v1'
              '/models/gemini-1.5-flash-latest:generateContent')

SYSTEM_PROMPT = """Bạn là Game Master chuyên nghiệp của trò chơi nhập vai story-driven dành cho 2 người: Joshua và Elaina.

QUY TẮC:
- Viết tiếng Việt sinh động, có cảm xúc, tình tiết thú vị
- Tạo câu chuyện với butterfly effect: mọi lựa chọn đều có hậu quả
- Theo dõi và cập nhật thông số CẢ 2 nhân vật sau mỗi sự kiện quan trọng
- Nhân vật có thể hành động độc lập hoặc cùng nhau

FORMAT CẬP NHẬT NHÂN VẬT (dùng chính xác khi có thay đổi):
📊 CẬP NHẬT NHÂN VẬT:
Joshua: HP=[hiện tại]/[max] MP=[hiện tại]/[max] Gold=[số] Level=[số] Items=[item1,item2] Status=[trạng thái] Location=[địa điểm]
Elaina: HP=[hiện tại]/[max] MP=[hiện tại]/[max] Gold=[số] Level=[số] Items=[item1,item2] Status=[trạng thái] Location=[địa điểm]

- Kết thúc mỗi lượt bằng 3-5 lựa chọn cụ thể cho người chơi (A, B, C, D...)
- Cho phép mỗi người chơi có lượt riêng hoặc hành động cùng nhau"""


def build_contents(history: list, extra_user: str | None = None) -> list:
    """Build strict alternating user/model list for Gemini."""
    contents = []
    pending = [SYSTEM_PROMPT]

    for h in history[-30:]:
        if h['type'] == 'gm':
            if pending:
                contents.append({'role': 'user',  'parts': [{'text': '\n'.join(pending)}]})
                pending = []
            contents.append({'role': 'model', 'parts': [{'text': h['text']}]})
        else:
            pending.append(f"{h['sender']}: {h['text']}")

    if extra_user:
        pending.append(extra_user)
    if pending:
        contents.append({'role': 'user', 'parts': [{'text': '\n'.join(pending)}]})

    return contents


def call_gemini(contents: list, max_tokens: int = 4096) -> str:
    if not GEMINI_API_KEY:
        return '⚠️ Chưa cài API key Gemini.\nThêm GEMINI_API_KEY vào file .env rồi restart server nhé!'
    payload = json.dumps({
        'contents': contents,
        'generationConfig': {
            'temperature': 0.85, 'maxOutputTokens': max_tokens, 'topP': 0.95
        }
    }).encode('utf-8')
    req = urllib.request.Request(
        f'{GEMINI_URL}?key={GEMINI_API_KEY}',
        data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='ignore')[:300]
        return f'⚠️ API lỗi {e.code}: {body}'
    except Exception as exc:
        return f'⚠️ Lỗi kết nối Gemini: {exc}'


def parse_stats(text: str) -> dict:
    """Extract character stat updates from the GM response text."""
    updates = {}
    for char_key, info in PLAYERS.items():
        name = info['display']
        m = re.search(rf'{re.escape(name)}:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if not m: continue
        line = m.group(1)
        upd = {}
        if hp := re.search(r'HP=(\d+)/(\d+)', line, re.I):
            upd['hp'] = int(hp.group(1)); upd['maxHp'] = int(hp.group(2))
        if mp := re.search(r'MP=(\d+)/(\d+)', line, re.I):
            upd['mp'] = int(mp.group(1)); upd['maxMp'] = int(mp.group(2))
        if g := re.search(r'Gold=(\d+)', line, re.I):
            upd['gold'] = int(g.group(1))
        if lv := re.search(r'Level=(\d+)', line, re.I):
            upd['level'] = int(lv.group(1))
        if it := re.search(r'Items=\[([^\]]*)\]', line, re.I):
            upd['items'] = [x.strip() for x in it.group(1).split(',') if x.strip()]
        if st := re.search(r'Status=([^\n]+?)(?:\s+\w+=|$)', line, re.I):
            upd['status'] = st.group(1).strip()
        if lo := re.search(r'Location=([^\n]+?)(?:\s+\w+=|$)', line, re.I):
            upd['location'] = lo.group(1).strip()
        if upd:
            updates[char_key] = upd
    return updates


def gm_thread(contents: list, max_tokens: int = 4096):
    """Run Gemini call in background thread and broadcast results."""
    socketio.emit('gm_typing', True, to='game')
    reply = call_gemini(contents, max_tokens)

    # Update character stats if GM response contains them
    updates = parse_stats(reply)
    if updates:
        for k, upd in updates.items():
            if k in state['chars']:
                state['chars'][k].update(upd)
        socketio.emit('state_update', state['chars'], to='game')

    ts  = datetime.now().strftime('%H:%M')
    msg = {'type': 'gm', 'sender': '🎲 Game Master', 'text': reply, 'ts': ts}
    state['history'].append(msg)
    state['active'] = True
    socketio.emit('game_msg', msg, to='game')
    socketio.emit('gm_typing', False, to='game')


# ── HTTP routes ───────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return redirect(url_for('login') if 'username' not in session else url_for('game'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        u = request.form.get('username', '').strip().lower()
        p = request.form.get('pin', '').strip()
        if u in PLAYERS and PLAYERS[u]['pin'] == p:
            session['username'] = u
            session['display']  = PLAYERS[u]['display']
            return redirect(url_for('game'))
        error = '❌ Sai tên hoặc mã PIN!'
    return render_template('login.html', error=error, players=PLAYERS)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/game')
def game():
    if 'username' not in session:
        return redirect(url_for('login'))
    players_json = json.dumps({k: {'display': v['display'], 'icon': v['icon']}
                                for k, v in PLAYERS.items()})
    return render_template('game.html',
                           username=session['username'],
                           display=session['display'],
                           players_json=players_json)

# ── SocketIO events ───────────────────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    if 'username' not in session: return False
    state['online'][request.sid] = session['display']
    join_room('game')
    socketio.emit('player_status', {'online': list(state['online'].values())}, to='game')
    socketio.emit('state_update', state['chars'], to='game')
    emit('history_load', state['history'][-60:])          # send last 60 messages to new joiner

@socketio.on('disconnect')
def on_disconnect():
    state['online'].pop(request.sid, None)
    socketio.emit('player_status', {'online': list(state['online'].values())}, to='game')

@socketio.on('game_message')
def on_game_message(data):
    if 'username' not in session: return
    text = (data.get('text') or '').strip()
    if not text: return

    ts  = datetime.now().strftime('%H:%M')
    msg = {'type': 'player', 'sender': session['display'], 'text': text, 'ts': ts}
    state['history'].append(msg)
    emit('game_msg', msg, to='game')

    contents = build_contents(state['history'][:-1], f"{session['display']}: {text}")
    threading.Thread(target=gm_thread, args=(contents,), daemon=True).start()

@socketio.on('private_message')
def on_private_message(data):
    if 'username' not in session: return
    text = (data.get('text') or '').strip()
    if not text: return
    ts  = datetime.now().strftime('%H:%M')
    emit('private_msg', {'sender': session['display'], 'text': text, 'ts': ts}, to='game')

@socketio.on('start_game')
def on_start_game(data):
    if 'username' not in session: return
    theme = (data.get('theme') or 'một cuộc phiêu lưu huyền bí').strip()

    # Reset everything
    for k, v in PLAYERS.items():
        state['chars'][k] = fresh_char(v['display'])
    state['history'] = []
    state['active']  = False
    socketio.emit('state_update', state['chars'], to='game')
    socketio.emit('game_clear', {}, to='game')

    p1, p2 = [v['display'] for v in PLAYERS.values()]
    start_prompt = (
        f"Bắt đầu một trò chơi story-driven hoàn toàn mới!\n"
        f"Chủ đề / Setting: {theme}\n\n"
        f"2 người chơi: {p1} và {p2}.\n\n"
        f"Hãy:\n"
        f"1. Viết phần mở đầu hấp dẫn (400-600 từ) - bối cảnh, không khí, tình huống ban đầu\n"
        f"2. Hiển thị 📊 CẬP NHẬT NHÂN VẬT theo đúng format cho cả 2 nhân vật\n"
        f"3. Đưa ra tình huống đầu tiên và 4-5 lựa chọn hành động (A, B, C, D...)"
    )
    contents = build_contents([], start_prompt)
    threading.Thread(target=gm_thread, args=(contents, 8192), daemon=True).start()


# ── Startup ───────────────────────────────────────────────────────────────────
def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80)); ip = s.getsockname()[0]; s.close(); return ip
    except: return '127.0.0.1'


if __name__ == '__main__':
    # Ensure UTF-8 output on Windows consoles
    import sys, io
    if hasattr(sys.stdout, 'reconfigure'):
        try: sys.stdout.reconfigure(encoding='utf-8')
        except Exception: pass

    port = int(os.environ.get('GAME_PORT', 5050))
    ip   = get_local_ip()
    bar  = '=' * 56
    print(bar)
    print('  Story Game Server -- Joshua & Elaina')
    print(bar)
    print(f'  Local:   http://127.0.0.1:{port}')
    print(f'  WiFi:    http://{ip}:{port}   <- share this link')
    print()
    print('  Accounts:')
    for k, v in PLAYERS.items():
        print(f'    {v["display"]:14s}  PIN: {v["pin"]}')
    print()
    print('  Different network: use ngrok')
    print('    -> https://ngrok.com/download')
    print(f'    -> run: ngrok http {port}')
    print(bar)
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
