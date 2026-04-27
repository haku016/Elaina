"""
Elaina's Birthday + Story RPG — one app.py runs everything.
Flask-SocketIO serves both the birthday site and the multiplayer story game.

Player 1 (host) : open app.py -> click Story RPG -> click Host -> share URL
Player 2 (join) : open app.py -> click Story RPG -> paste Player 1's URL

Install:
    pip install PyQt6 PyQt6-WebEngine flask flask-socketio simple-websocket python-dotenv pyngrok

For internet play add to .env:
    NGROK_AUTHTOKEN=<your free token from ngrok.com>
"""

import sys
import os
import re
import threading
import socket
import time
import json
import mimetypes
import posixpath
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime
from PyQt6.QtWidgets import QApplication, QMainWindow, QSplashScreen
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEngineSettings, QWebEngineProfile
from PyQt6.QtCore import QUrl, Qt, QTimer
from PyQt6.QtGui import QIcon, QPixmap

# ── Load API key from .env ──────────────────────────────────────────────────
# Determine directory: next to the .exe when frozen, next to app.py otherwise
_env_dir = (os.path.dirname(sys.executable)
            if getattr(sys, 'frozen', False)
            else os.path.dirname(os.path.abspath(__file__)))
_env_file = os.path.join(_env_dir, '.env')

def _parse_env_file(path: str) -> None:
    """Minimal .env parser – no third-party dependency required."""
    if not os.path.isfile(path):
        return
    try:
        with open(path, encoding='utf-8') as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, val = line.partition('=')
                key = key.strip()
                # Strip optional surrounding quotes
                val = val.strip().strip('"').strip("'")
                if key:
                    os.environ[key] = val
    except OSError:
        pass

# Always parse manually first (works in frozen exe without dotenv)
_parse_env_file(_env_file)

# Also run dotenv if available (handles edge cases like multi-line values)
try:
    from dotenv import load_dotenv
    load_dotenv(_env_file, override=True)
except ImportError:
    pass

# ── Paths ────────────────────────────────────────────────────────────────────
# When frozen by PyInstaller, static assets are extracted to sys._MEIPASS
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_TMPL_DIR = os.path.join(BASE_DIR, 'templates')
_PORT = int(os.environ.get('GAME_PORT', '5050'))
_tunnel_url: str | None = None  # filled by pyngrok background thread


def _local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]; s.close(); return ip
    except Exception:
        return '127.0.0.1'


def _start_tunnel() -> None:
    """Start an ngrok tunnel in a background thread (requires NGROK_AUTHTOKEN in .env)."""
    global _tunnel_url
    try:
        from pyngrok import ngrok
        token = os.environ.get('NGROK_AUTHTOKEN', '')
        if token:
            ngrok.set_auth_token(token)
        t = ngrok.connect(_PORT)
        _tunnel_url = t.public_url.rstrip('/')
    except Exception:
        _tunnel_url = None


# ══════════════════════════════════════════════════════════════════
#  Story RPG — player config, Gemini AI, Flask-SocketIO server
# ══════════════════════════════════════════════════════════════════
from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room

PLAYERS = {
    os.environ.get('PLAYER1_NAME', 'Joshua').lower(): {
        'display': os.environ.get('PLAYER1_NAME', 'Joshua'),
        'pin':     os.environ.get('PLAYER1_PIN', '1111'),
        'icon':    '\u2694\ufe0f',
    },
    os.environ.get('PLAYER2_NAME', 'Elaina').lower(): {
        'display': os.environ.get('PLAYER2_NAME', 'Elaina'),
        'pin':     os.environ.get('PLAYER2_PIN', '2222'),
        'icon':    '\U0001f338',
    },
}

def _fresh_char(name):
    return dict(name=name, hp=20, maxHp=20, mp=20, maxMp=20,
                level=1, gold=0, items=[], status='Bình thường', location='Khởi đầu')

game_state = {
    'chars':           {k: _fresh_char(v['display']) for k, v in PLAYERS.items()},
    'online':          {},
    'history':         [],
    'active':          False,
    'pending_actions': {},   # {display_name: action_text} — collects both players' actions
}

_GEMINI_BASE   = 'https://generativelanguage.googleapis.com'
_model_cache: tuple | None = None
_model_lock    = threading.Lock()

_PREFERRED_MODELS = [
    # Ranked by live benchmark (fastest responding first)
    ('v1beta', 'gemini-2.5-flash-lite'),      # 1.03s  ✓
    ('v1beta', 'gemini-3-flash-preview'),      # 1.58s  ✓
    ('v1beta', 'gemini-2.5-flash'),            # ~2s    ✓ (sometimes 503)
    ('v1beta', 'gemini-3.1-flash-lite-preview'), # 8.6s  ✓ (slow fallback)
    ('v1beta', 'gemini-flash-latest'),         # last resort
]


def _get_model(api_key: str) -> tuple[str, str]:
    """Discover the best available Gemini model, cached after first call."""
    global _model_cache
    with _model_lock:
        if _model_cache:
            return _model_cache
        try:
            url = f'{_GEMINI_BASE}/v1beta/models?key={api_key}'
            with urllib.request.urlopen(url, timeout=8) as r:
                data = json.loads(r.read())
            avail = {
                m['name'].replace('models/', '')
                for m in data.get('models', [])
                if 'generateContent' in m.get('supportedGenerationMethods', [])
            }
            for ver, name in _PREFERRED_MODELS:
                if name in avail:
                    _model_cache = (ver, name)
                    return _model_cache
        except Exception:
            pass
        _model_cache = _PREFERRED_MODELS[0]
        return _model_cache


_SYSTEM_PROMPT = (
    "Bạn là Game Master chuyên nghiệp của trò chơi nhập vai story-driven dành cho 2 người.\n\n"
    "QUY TẮc:\n"
    "- Viết hoàn toàn bằng tiếng Việt, sinh động, hấp dẫn, có chiều sâu cảm xúc\n"
    "- Tạo câu chuyện với butterfly effect: mọi lựa chọn đều có hậu quả thực sự\n"
    "- Theo dõi và cập nhật thông số CẢ 2 nhân vật sau mỗi sự kiện quan trọng\n"
    "- Nhân vật có thể hành động độc lập hoặc hợp tác cùng nhau\n\n"
    "FORMAT CẬP NHẬT (bắt buộc sau mỗi lượt khi có thay đổi chỉ số):\n"
    "[STATS]\n"
    "{p1}: HP=[hp]/[maxhp] MP=[mp]/[maxmp] Gold=[g] Level=[lv] Items=[i1,i2] Status=[trạng thái] Location=[địa điểm]\n"
    "{p2}: HP=[hp]/[maxhp] MP=[mp]/[maxmp] Gold=[g] Level=[lv] Items=[i1,i2] Status=[trạng thái] Location=[địa điểm]\n"
    "[/STATS]\n\n"
    "Kết thúc mỗi lượt bằng 3-5 lựa chọn cụ thể (A. B. C. D...)"
)


def _build_contents(history, extra_user=None):
    p1, p2 = [v['display'] for v in PLAYERS.values()]
    system = _SYSTEM_PROMPT.format(p1=p1, p2=p2)
    contents = []
    pending = [system]
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


def _call_gemini(contents, max_tokens=4096, _tried: set | None = None):
    key = os.environ.get('GEMINI_API_KEY', '')
    if not key:
        return 'Chưa cài API key Gemini. Thêm GEMINI_API_KEY vào file .env rồi khởi động lại nhé!'
    if _tried is None:
        _tried = set()
    ver, model = _get_model(key)
    if model in _tried:
        print(f'[Gemini] All candidates tried {_tried}, giving up.')
        return 'Gemini hiện đang bận, vui lòng thử lại sau ít phút nhé!'
    _tried.add(model)
    print(f'[Gemini] Trying {ver}/{model} (tried so far: {_tried})')
    api_url = f'{_GEMINI_BASE}/{ver}/models/{model}:generateContent?key={key}'
    payload = json.dumps({
        'contents': contents,
        'generationConfig': {'temperature': 0.85, 'maxOutputTokens': max_tokens, 'topP': 0.95},
    }).encode('utf-8')
    req = urllib.request.Request(
        api_url, data=payload,
        headers={'Content-Type': 'application/json'}, method='POST')
    for attempt in range(3):
        try:
            t0 = time.time()
            with urllib.request.urlopen(req, timeout=60) as r:
                resp = json.loads(r.read())
            elapsed = time.time() - t0
            # Extract text — skip thought parts (thinking models return thought=True parts)
            parts = resp['candidates'][0]['content'].get('parts', [])
            text = next((p['text'] for p in parts if not p.get('thought')), None)
            if text is None:
                raise KeyError('No non-thought parts in response')
            print(f'[Gemini] OK {ver}/{model} in {elapsed:.2f}s')
            return text
        except urllib.error.HTTPError as e:
            err_body = e.read().decode(errors='ignore')[:300]
            print(f'[Gemini] HTTP {e.code} from {model} (attempt {attempt+1}): {err_body[:120]}')
            if e.code == 429:
                wait = 15 * (attempt + 1)
                print(f'[Gemini] Rate limited, waiting {wait}s...')
                time.sleep(wait)
                continue
            if e.code in (404, 503):
                print(f'[Gemini] {e.code} — switching to next model')
                with _model_lock:
                    global _model_cache
                    _model_cache = None
                    for v, n in _PREFERRED_MODELS:
                        if n not in _tried:
                            _model_cache = (v, n)
                            break
                return _call_gemini(contents, max_tokens, _tried)
            return f'Lỗi API {e.code}: {err_body}'
        except (KeyError, IndexError) as exc:
            print(f'[Gemini] Bad response shape from {model}: {exc}')
            # Try next model
            with _model_lock:
                _model_cache = None
                for v, n in _PREFERRED_MODELS:
                    if n not in _tried:
                        _model_cache = (v, n)
                        break
            return _call_gemini(contents, max_tokens, _tried)
        except Exception as exc:
            print(f'[Gemini] Exception from {model}: {exc}')
            return f'Lỗi kết nối Gemini: {exc}'
    print(f'[Gemini] Rate limit exhausted for {model}')
    return 'Gemini đang bận (rate limit), vui lòng thử lại sau 1 phút.'


def _parse_stats(text):
    updates = {}
    block_m = re.search(r'\[STATS\](.*?)\[/STATS\]', text, re.DOTALL | re.IGNORECASE)
    block = block_m.group(1) if block_m else text
    for char_key, info in PLAYERS.items():
        name = info['display']
        m = re.search(rf'{re.escape(name)}:\s*(.+?)(?:\n|$)', block, re.IGNORECASE)
        if not m:
            continue
        line = m.group(1)
        upd = {}
        if hp := re.search(r'HP=(\d+)/(\d+)', line, re.I):
            upd['hp'] = int(hp.group(1)); upd['maxHp'] = int(hp.group(2))
        if mp := re.search(r'MP=(\d+)/(\d+)', line, re.I):
            upd['mp'] = int(mp.group(1)); upd['maxMp'] = int(mp.group(2))
        if g  := re.search(r'Gold=(\d+)', line, re.I):
            upd['gold'] = int(g.group(1))
        if lv := re.search(r'Level=(\d+)', line, re.I):
            upd['level'] = int(lv.group(1))
        if it := re.search(r'Items=\[([^\]]*)\]', line, re.I):
            upd['items'] = [x.strip() for x in it.group(1).split(',') if x.strip()]
        if st := re.search(r'Status=([^\n\[]+?)(?:\s+\w+=|\[|$)', line, re.I):
            upd['status'] = st.group(1).strip()
        if lo := re.search(r'Location=([^\n\[]+?)(?:\s+\w+=|\[|$)', line, re.I):
            upd['location'] = lo.group(1).strip()
        if upd:
            updates[char_key] = upd
    return updates


# ── Flask + SocketIO ──────────────────────────────────────────────────────────
_flask_app = Flask(__name__, template_folder=_TMPL_DIR)
_flask_app.secret_key = os.environ.get('SECRET_KEY', 'storymaster-secret-2025')
_sio = SocketIO(_flask_app, cors_allowed_origins='*', async_mode='threading')


def _gm_thread(contents, max_tokens=4096):
    _sio.emit('gm_typing', True, to='game')
    reply = _call_gemini(contents, max_tokens)
    updates = _parse_stats(reply)
    if updates:
        for k, upd in updates.items():
            if k in game_state['chars']:
                game_state['chars'][k].update(upd)
        _sio.emit('state_update', game_state['chars'], to='game')
    ts  = datetime.now().strftime('%H:%M')
    msg = {'type': 'gm', 'sender': 'Game Master', 'text': reply, 'ts': ts}
    game_state['history'].append(msg)
    game_state['active'] = True
    _sio.emit('game_msg', msg, to='game')
    _sio.emit('gm_typing', False, to='game')


# ── Flask + SocketIO ──────────────────────────────────────────────────────────
from flask import Flask, render_template, request, session, redirect, url_for, Response
from flask_socketio import SocketIO, emit, join_room

_flask_app = Flask(__name__, template_folder=_TMPL_DIR)
_flask_app.secret_key = os.environ.get('SECRET_KEY', 'storymaster-secret-2025')
_sio = SocketIO(_flask_app, cors_allowed_origins='*', async_mode='threading')


# ── Birthday static files (catch-all, must be declared BEFORE application starts) ──
@_flask_app.route('/', defaults={'path': ''})
@_flask_app.route('/birthday')
def _birthday_index(path=''):
    filepath = os.path.join(BASE_DIR, 'index.html')
    with open(filepath, 'rb') as f:
        raw = f.read()
    api_key = os.environ.get('GEMINI_API_KEY', '')
    inject = (
        '<script>'
        f'window.GEMINI_API_KEY={json.dumps(api_key)};'
        'function openGame(){window.location.href="/lobby";}'
        '</script>\n'
    )
    html = raw.decode('utf-8').replace('</head>', inject + '</head>', 1)
    return Response(html.encode('utf-8'), mimetype='text/html; charset=utf-8')


@_flask_app.route('/<path:filename>', endpoint='_static_file')
def _serve_birthday_static(filename):
    # Security: block requests that escape BASE_DIR
    safe = posixpath.normpath('/' + urllib.parse.unquote(filename)).lstrip('/')
    filepath = os.path.realpath(os.path.join(BASE_DIR, safe))
    if not filepath.startswith(os.path.realpath(BASE_DIR)):
        return '', 403
    if not os.path.isfile(filepath):
        return '', 404
    mime = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
    if mime.startswith('text/'):
        mime = mime.split(';')[0] + '; charset=utf-8'
    with open(filepath, 'rb') as f:
        data = f.read()
    return Response(data, mimetype=mime)


# ── Lobby (host / join chooser) ───────────────────────────────────────────────
@_flask_app.route('/lobby')
def _lobby():
    ip = _local_ip()
    local_url = f'http://{ip}:{_PORT}'
    return render_template(
        'lobby.html',
        local_url=local_url,
        tunnel_url=_tunnel_url or '',
    )


@_flask_app.route('/api/tunnel')
def _api_tunnel():
    ip = _local_ip()
    return Response(json.dumps({
        'local':  f'http://{ip}:{_PORT}',
        'public': _tunnel_url,
    }), mimetype='application/json')

# ── Game routes ──────────────────────────────────────────────────────────
@_flask_app.route('/login', methods=['GET', 'POST'])
def _glogin():
    error = None
    if request.method == 'POST':
        u = request.form.get('username', '').strip().lower()
        p = request.form.get('pin', '').strip()
        if u in PLAYERS and PLAYERS[u]['pin'] == p:
            session['username'] = u
            session['display']  = PLAYERS[u]['display']
            return redirect(url_for('_ggame'))
        error = '❌ Wrong name or PIN!'
    return render_template('login.html', error=error, players=PLAYERS)

@_flask_app.route('/logout')
def _glogout():
    session.clear()
    return redirect(url_for('_glogin'))

@_flask_app.route('/game')
def _ggame():
    if 'username' not in session:
        return redirect(url_for('_glogin'))
    players_json = json.dumps({k: {'display': v['display'], 'icon': v['icon']}
                                for k, v in PLAYERS.items()})
    return render_template('game.html',
                           username=session['username'],
                           display=session['display'],
                           players_json=players_json)

@_sio.on('connect')
def _sio_connect():
    if 'username' not in session:
        return False
    game_state['online'][request.sid] = session['display']
    join_room('game')
    _sio.emit('player_status', {'online': list(game_state['online'].values())}, to='game')
    _sio.emit('state_update', game_state['chars'], to='game')
    emit('history_load', game_state['history'][-60:])

@_sio.on('disconnect')
def _sio_disconnect():
    game_state['online'].pop(request.sid, None)
    _sio.emit('player_status', {'online': list(game_state['online'].values())}, to='game')

@_sio.on('game_message')
def _sio_game_msg(data):
    if 'username' not in session:
        return
    text = (data.get('text') or '').strip()
    if not text:
        return
    ts      = datetime.now().strftime('%H:%M')
    display = session['display']
    msg = {'type': 'player', 'sender': display, 'text': text, 'ts': ts}
    game_state['history'].append(msg)
    emit('game_msg', msg, to='game')

    num_online = len(game_state['online'])   # how many players connected
    pending    = game_state['pending_actions']

    # --- Dual-action mode: both players online ---
    if num_online >= 2:
        pending[display] = text
        both_displays = [v['display'] for v in PLAYERS.values()]

        if len(pending) < 2:
            # First player submitted — tell everyone who is waiting
            waiting_for = [n for n in both_displays if n not in pending]
            _sio.emit('turn_status', {
                'waiting': True,
                'submitted': list(pending.keys()),
                'waiting_for': waiting_for,
            }, to='game')
        else:
            # Both actions received — build combined prompt and call GM
            p1_disp, p2_disp = both_displays
            combined = (
                f'{p1_disp}: {pending.get(p1_disp, "(chưa có hành động)")}\n'
                f'{p2_disp}: {pending.get(p2_disp, "(chưa có hành động)")}'
            )
            game_state['pending_actions'] = {}   # reset for next turn
            _sio.emit('turn_status', {'waiting': False}, to='game')
            contents = _build_contents(game_state['history'][:-1], combined)
            threading.Thread(target=_gm_thread, args=(contents,), daemon=True).start()
    else:
        # Solo mode — trigger GM immediately
        game_state['pending_actions'] = {}
        contents = _build_contents(game_state['history'][:-1], f"{display}: {text}")
        threading.Thread(target=_gm_thread, args=(contents,), daemon=True).start()

@_sio.on('private_message')
def _sio_private(data):
    if 'username' not in session:
        return
    text = (data.get('text') or '').strip()
    if not text:
        return
    ts = datetime.now().strftime('%H:%M')
    emit('private_msg', {'sender': session['display'], 'text': text, 'ts': ts}, to='game')

@_sio.on('start_game')
def _sio_start(data):
    if 'username' not in session:
        return
    theme = (data.get('theme') or 'phiêu lưu huyền bí').strip()
    for k, v in PLAYERS.items():
        game_state['chars'][k] = _fresh_char(v['display'])
    game_state['history']         = []
    game_state['active']          = False
    game_state['pending_actions'] = {}
    _sio.emit('state_update', game_state['chars'], to='game')
    _sio.emit('game_clear', {}, to='game')
    p1, p2 = [v['display'] for v in PLAYERS.values()]
    start_prompt = (
        f'Bắt đầu game story RPG mới!\n'
        f'Chủ đề / Setting: {theme}\n'
        f'2 người chơi: {p1} và {p2}.\n\n'
        f'Hãy:\n'
        f'1. Viết phần mở đầu hấp dẫn (400-600 từ) - bối cảnh, không khí, tình huống ban đầu\n'
        f'2. Hiển thị [STATS]...[/STATS] cho cả 2 nhân vật\n'
        f'3. Đưa ra tình huống đầu tiên và 4-5 lựa chọn hành động (A. B. C. D...)'
    )
    contents = _build_contents([], start_prompt)
    threading.Thread(target=_gm_thread, args=(contents, 8192), daemon=True).start()


# ── PyQt6 window ─────────────────────────────────────────────────────
class BirthdayWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Elaina's Birthday 🕸️")
        icon_path = os.path.join(BASE_DIR, 'assests', 'gwen_2.png')
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))

        self.showMaximized()

        self.browser = QWebEngineView()
        s = self.browser.settings()
        s.setAttribute(QWebEngineSettings.WebAttribute.AutoLoadImages, True)
        s.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        s.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)
        s.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        s.setAttribute(QWebEngineSettings.WebAttribute.PlaybackRequiresUserGesture, False)
        s.setAttribute(QWebEngineSettings.WebAttribute.AllowWindowActivationFromJavaScript, True)
        profile = QWebEngineProfile.defaultProfile()
        profile.setPersistentCookiesPolicy(
            QWebEngineProfile.PersistentCookiesPolicy.NoPersistentCookies
        )
        self.browser.setUrl(QUrl(f'http://127.0.0.1:{_PORT}/'))
        self.setCentralWidget(self.browser)

    def keyPressEvent(self, event):
        if event.key() == Qt.Key.Key_F11:
            if self.isFullScreen():
                self.showMaximized()
            else:
                self.showFullScreen()
        elif event.key() == Qt.Key.Key_Escape:
            if self.isFullScreen():
                self.showMaximized()
        else:
            super().keyPressEvent(event)


# ── Entry point ──────────────────────────────────────────────────────────────────
def main():
    # Start Flask-SocketIO server (birthday site + game, same port)
    threading.Thread(
        target=lambda: _sio.run(
            _flask_app, host='0.0.0.0', port=_PORT,
            debug=False, allow_unsafe_werkzeug=True
        ),
        daemon=True,
    ).start()

    # Optional ngrok tunnel in background (fills _tunnel_url when ready)
    threading.Thread(target=_start_tunnel, daemon=True).start()

    # Brief pause so Flask binds before WebEngine connects
    time.sleep(1.0)

    qt = QApplication(sys.argv)
    qt.setApplicationName("Elaina's Birthday")
    qt.setApplicationDisplayName("Elaina's Birthday")

    splash_icon = os.path.join(BASE_DIR, 'assests', 'gwen_2.png')
    if os.path.exists(splash_icon):
        splash_pix = QPixmap(splash_icon).scaled(
            300, 300,
            Qt.AspectRatioMode.KeepAspectRatio,
            Qt.TransformationMode.SmoothTransformation
        )
        splash = QSplashScreen(splash_pix, Qt.WindowType.WindowStaysOnTopHint)
        splash.show()
        qt.processEvents()
    else:
        splash = None

    window = BirthdayWindow()
    window.show()

    if splash:
        QTimer.singleShot(1500, splash.close)

    sys.exit(qt.exec())


if __name__ == '__main__':
    main()
