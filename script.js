let currentZIndex = 1000;
// Hàm mở popup với vị trí riêng
function openWindow(id) {
    const win = document.getElementById("window" + id);
    win.classList.remove("hidden");
    win.style.zIndex = currentZIndex++;

    // Đặt vị trí khác nhau cho mỗi cửa sổ
    if (id === 1) {
        win.style.top = "100px";
        win.style.left = "100px";
    } else if (id === 2) {
        win.style.top = "150px";
        win.style.left = "600px";
    } else if (id === 3) {
        win.style.top = "200px";
        win.style.left = "1100px";
    }

    // Tự động phát nhạc khi mở cửa sổ
    const music = document.getElementById("music" + id);
    if (music) {
        music.play().catch(error => {
            console.log("Tự động phát bị chặn, hãy tương tác với trang trước: ", error);
        });
    }
}

// Hàm đóng popup
function closeWindow(id) {
    const win = document.getElementById("window" + id);
    win.classList.add("hidden");
    const music = document.getElementById("music" + id);
    if (music) {
        music.pause();
        music.currentTime = 0; // Đặt lại thời gian nhạc khi đóng
    }
}

// Hàm toggle play/stop nhạc
const playlist = [
    {
      audio: "music/bird_of_a_feather.mp3",
      image: "images/boaf.jpg",
      text: 
      `
      <p><strong>BIRDS OF A FEATHER:</strong></p>
      <p><strong>Thiệt tình là mình cũng chỉ mới loáng thoáng nghe qua bài này thôi, chắc là sẽ không nghe luôn nếu như là bạn không up cho story sinh nhật mình.</strong></p>
      <p><strong>Nhưng mà sau khi mình xem lời xong thật sự mình rất là thích á. Mình cảm thấy bạn yêu mình rất là nhiều. <i>"I don't know why I'm crying"</i> - Giờ mình nghe bài này không thể nào mà mình không rưng rưng được á, kiểu mỗi lần nghe tới mình lại thấy là bạn thương mình nhiều lắm lắm. Đôi khi mình cũng có hơi nhạy cảm nên lúc đó mình bị sự bất an lấn át cái việc là mình cũng thấy được tình yêu của bạn rất là lớn.</strong></p>
      <p><strong>Mình nghĩ mình đã xem bài này như là một phần trong câu chuyện của 2 đứa mình rồi.</strong></p>
    `
    },
    {
      audio: "music/muse.mp3",
      image: "images/muse.jpg",
      text: `
      <p><strong>Muse:</strong></p>
      <p>Lúc đó mình cũng không expect gì nhiều từ cái facebook dating, nhưng mà mình nói trong bụng là thôi nốt lần này. Mình cũng biết là bạn cũng không expect được mình, nhưng mà hai đứa tự nhiên va vào nhau rồi nói chuyện quá trời quá đất hả =))</p>
      <p>Mình vui lắm, kiểu thật sự mình luôn nói với bạn bè mình về việc mình muốn tìm một bạn thích người nhện giống mình xong cùng nhau làm những chuyện silly ahh á.</p>
      <p>Đầu tiên nghe bài này của bạn đăng mình cũng thật sự là không nghĩ gì nhiều, kiểu mình cũng thấy nó hơi nhẹ với mình nhưng mà kiểu cái line:</p>
      <p>"A lot of people that could be my muse You're the one that I will choose We get along so fine, and we both don't care about the time"</p>
      <p>Thật sự là đã hit mình rất là mạnh, đúng là matching vibe ha. Mình nghĩ kiểu đúng là làm chuyện điên khùng thì vui, nhưng mà mình thấy là miễn là những chuyện dù đơn giản tụi mình cũng tận hưởng cùng nhau là được.</p>
      <p>Đi một chặng thì thấy tụi mình cũng có những thứ khác nhau, mong là dù có khác nhau tụi mình vẫn trân quý về việc tìm được nhau trong cái cuộc sống bộn bề này ha.</p>
      `
    },
    {
      audio: "music/247365.mp3",
      image: "images/img4.jpg",
      text: `
      <p><strong>24/7, 365:</strong></p>
      <p>Đúng là có những ngày chủ nhật mà mình ở bên cạnh bạn cả ngày rồi mà không đủ á, xong rồi ngày nào cũng chạy qua bạn nhưng đúng là cũng không đủ. Chắc là cũng cần phải dính 24/7 - 365 ngày áaa.</p>
      <p>Mình cũng không ngờ là mình dính người tới như vậy, có lẽ là không phải dính người mà là do dính bạn thì đúng hơn.</p>
      <p><i>"Seven minutes with you, It's heaven"</i></p>
      <p>Dù là có bận tới đâu thì mình nghĩ gặp bạn được 5 phút trong ngày cũng là mãn nguyện đối với mình rồi.</p>

      `
    },
    {
      audio: "music/feelit.mp3",
      image: "images/feelit.jpg",
      text: `
      <p><strong>Feel it:</strong></p>
      <p>Bài này thì từ phía mình, mình cũng nói với bạn là mình thích từ lúc mà có một cái ghép với Miles và Gwen.</p>
      <p>Không chỉ vậy bài cũng phù hợp với tình hình của mình lúc đó. Lúc bạn hỏi mình:</p>
      <p><i>"Quốc Khang à bạn đã phải trải qua những gì vậy?"</i></p>
      <p>Những thứ trải qua của mình thật sự cũng không nhiều tới vậy á, nhưng mà mỗi một sai lầm mình rút ra được nhiều thứ khác nhau. Từ đó thế giới quan của mình bắt đầu mở ra và kiểu mình nghĩ nhiều hơn mỗi lần mình gặp một chuyện gì đó.</p>
      <p>Thành thật thì trước Tết mình vẫn còn những cái vết trong lòng từ những chuyện của mình ở Sài Gòn, sau đó thì mình dần chấp nhận xong rồi cũng bắt đầu cái Spider-phase của mình. Mặc dù mình cũng vui nhưng mà trong lòng mình cũng còn một cái gì đó nặng.</p>
      <p>Cho đến khi gặp bạn.</p>
      <p><i>"It's like you - take away the pain. Baby I'm healing"</i></p>
      <p>Ban đầu mình cũng còn sợ nhiều thứ tương lai, nhưng mà đúng là cái mối nhân duyên này</p>
      <p><i>"This is the type of love you can't ignore"</i> - which is once in a lifetime</p>
      `
    }
  ];
  
  let currentIndex = 0;
  let audio = document.querySelector("#music2"); 
  let disc = document.querySelector("#window2 .disc");
  let text = document.querySelector("#window2 p");
  let playPauseIcon = document.getElementById("playPauseIcon");
  
  // load 1 bài trong playlist
  function loadSong(index, autoPlay = true) {
    const song = playlist[index];
    audio.src = song.audio;
    disc.src = song.image;
    text.innerHTML = song.text;
  
    if (autoPlay) {
      audio.play();
      playPauseIcon.src = "assests/pause_btn-removebg-preview.png";
    } else {
      playPauseIcon.src = "assests/play_btn-removebg-preview.png";
    }
  }
  
  // play/pause toggle
  function toggleMusic() {
    if (audio.paused) {
      audio.play();
      playPauseIcon.src = "assests/pause_btn-removebg-preview.png";
    } else {
      audio.pause();
      playPauseIcon.src = "assests/play_btn-removebg-preview.png";
    }
  }
  
  // next / prev
  function nextSong() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
  }
  
  function prevSong() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex);
  }
  
  // load lần đầu
  loadSong(currentIndex, false);  

// Drag & Drop cửa sổ
function dragMouseDown(e, titleBar) {
    e.preventDefault();

    const popup = titleBar.parentElement;
    let offsetX = e.clientX - popup.offsetLeft;
    let offsetY = e.clientY - popup.offsetTop;

    popup.style.zIndex = currentZIndex++; // Tăng z-index khi kéo

    document.onmousemove = (ev) => {
        popup.style.left = (ev.clientX - offsetX) + "px";
        popup.style.top = (ev.clientY - offsetY) + "px";
    };

    document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
    };
}

document.addEventListener('DOMContentLoaded', () => {
  // ----- Album 4 (Memory 4) -----
  const album4 = [
    { image: "images/img4.jpg", text: "Đáng lẽ chỗ này mình định up mấy cái kỉ niệm của tụi mình nhưng mà nhiều cái mình thích quá nên là thôi có gì để đợt sau vậy." },
    { image: "images/img1.jpg", text: "Hơi lưu manh một tí bây giờ mình chơi một cái game đi ha, mình ra hint là ý nghĩa món quà mình tặng bạn, rồi bạn sẽ đoán món quà. Mình biết đoán không ra bạn sẽ asdasdmk nhưng mà mình không reveal quà trên đây được tại vì bạn sẽ nhận cái này vào đầu ngày 27/09. Thôi TLDR: Let's swing!!" },  
    { image: "images/usagi.jpg", text: "Món đầu mình sẽ hint dễ một xíu (Vì có hình liên quan). Món này mình muốn tặng bạn một phần là bạn thích, một phần là mình muốn gửi tới bạn là: Cuộc sống rất là nhiều điều bất ngờ á, nhiều khi cũng dựa trên hên xui may rủi một phần nữa, mình sẽ không biết mình sẽ gặp những điều gì nên cứ tận hưởng nó ha." },
    { image: "images/chiikawa-hachieware.gif", text: "Món này thì hơi trẻ con một xíu, nhưng mà nó dễ thươngg. Món này thì mình chúc bạn lúc nào cũng được ăn ngon, khỏe mạnh áaa." },
    { image: "images/123.jpg", text: "Hi, còn món thứ 3 này là tượng trưng cho tụi mình với câu chuyện của tụi mình gặp nhau. (Này thì hơi khó đoán - Thơm một cái để nhận hint)" },
    { image: "images/string.jpg", text: "Món này cũng khó đoán nốt. Này là cái đi kèm cho món thứ 3 và là biểu tượng cho sợi tơ (nhện) duyện của tụi mình." },
    { image: "images/spongebob.jpg", text: "Món cuối thì dễ vì mình spoil cho bạn ời. Món cuối là mình muốn bạn vui vẻ như con trên hình nè, với lại cũng muốn chúc bạn luôn xinh đẹp dễ thương s1tg" },
  ];
  let albumIndex4 = 0;
  const albumImage4 = document.getElementById("albumImage4");
  const albumText4  = document.getElementById("albumText4");

  function loadAlbum4(index) {
    const item = album4[index];
    if (!albumImage4 || !albumText4) return;
    albumImage4.src = item.image;
    albumText4.innerText = item.text;
  }

  window.nextAlbum4 = function() {
    albumIndex4 = (albumIndex4 + 1) % album4.length;
    loadAlbum4(albumIndex4);
  };
  window.prevAlbum4 = function() {
    albumIndex4 = (albumIndex4 - 1 + album4.length) % album4.length;
    loadAlbum4(albumIndex4);
  };

  if (albumImage4) loadAlbum4(albumIndex4);


  // ----- Album 5 (Spider Gwen) -----
  const album5 = [
    { image: "assests/josh_elai_spider.png", text: "“In a city of neon lights and endless rain, two webslingers find themselves bound by fate across fractured worlds. One carries sparks of restless energy, the other moves with quiet rhythm, both caught in the echoes of a collapsing multiverse. Together, they weave their way through towering skylines and shadowed alleys, hunted by those who seek to control the rift. Against neon gods and broken machines, their bond becomes the signal that cuts through static, a promise that even across worlds, they are always in the same universe.”" },
    { image: "assests/jester_princess.png", text: "“In a kingdom where the gods show little mercy, one soul longs to break free from the chains of fate. Along the way, they find a companion, the only one who can bring a true smile amidst the cold walls. Together, they leave safety behind and walk a shadowed path toward the Sacred Well, facing cruel trials, strange temptations, and wounds that may never heal. Yet in the darkness, their bond becomes the single flame that lights the way to an ending they will write for themselves.”" },
    { image: "assests/tanthe.png", text: "“The rain never stopped. Streets drowned, homes vanished, people fought over scraps of food. In the chaos of the flood, one soul died, only to wake again in the days before it began. This time, with memories of the end, they start stockpiling supplies... preparing for the storm no one else believes in.”" }
  ];
  let albumIndex5 = 0;
  const albumImage5 = document.getElementById("albumImage5");
  const albumText5  = document.getElementById("albumText5");

  function loadAlbum5(index) {
    const item = album5[index];
    if (!albumImage5 || !albumText5) return;
    albumImage5.src = item.image;
    albumText5.innerText = item.text;
  }

  window.nextAlbum5 = function() {
    albumIndex5 = (albumIndex5 + 1) % album5.length;
    loadAlbum5(albumIndex5);
  };
  window.prevAlbum5 = function() {
    albumIndex5 = (albumIndex5 - 1 + album5.length) % album5.length;
    loadAlbum5(albumIndex5);
  };

  if (albumImage5) loadAlbum5(albumIndex5);


  // ----- Gwen click mở popup #window5 và reset album5 -----
  const gwen = document.getElementById("gwen");
  if (gwen) {
    gwen.addEventListener("click", () => {
      const win5 = document.getElementById("window5");
      if (win5) {
        openWindow(5);
        albumIndex5 = 0;
        loadAlbum5(albumIndex5);
      }
    });
  }
});

// Chat Box Functionality
const chatContent = document.getElementById('chatContent');
const chatInput = document.getElementById('chatInput');

// Game state management
let currentGameState = {
    isPlaying: false,
    characterStats: null
};

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.classList.toggle('hidden');
    
    // Focus vào input khi mở chat
    if (!chatBox.classList.contains('hidden')) {
        if (chatInput) chatInput.focus();
    }
}

// Update stats panel
function updateStatsPanel(stats) {
    const statsContainer = document.getElementById('statsContainer');
    const statsEmpty = document.getElementById('statsEmpty');
    
    if (!stats) {
        statsEmpty.style.display = 'block';
        statsContainer.innerHTML = '';
        return;
    }
    
    statsEmpty.style.display = 'none';
    currentGameState.characterStats = stats;
    
    let html = '';
    
    // Character Name
    if (stats.name) {
        html += `
            <div class="stat-item">
                <div class="stat-label">👤 TÊN NHÂN VẬT</div>
                <div class="stat-value">${stats.name}</div>
            </div>
        `;
    }
    
    // Health
    if (stats.health !== undefined) {
        const healthPercent = stats.maxHealth ? (stats.health / stats.maxHealth * 100) : 100;
        html += `
            <div class="stat-item">
                <div class="stat-label">❤️ SỨC KHỎE</div>
                <div class="stat-value">${stats.health}${stats.maxHealth ? '/' + stats.maxHealth : ''}</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${healthPercent}%; background: linear-gradient(90deg, #ff4d4d, #ff8080);"></div>
                </div>
            </div>
        `;
    }
    
    // Mana/Energy
    if (stats.mana !== undefined || stats.energy !== undefined) {
        const manaValue = stats.mana !== undefined ? stats.mana : stats.energy;
        const maxMana = stats.maxMana || stats.maxEnergy || 100;
        const manaPercent = (manaValue / maxMana * 100);
        html += `
            <div class="stat-item">
                <div class="stat-label">✨ NĂNG LƯỢNG</div>
                <div class="stat-value">${manaValue}/${maxMana}</div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${manaPercent}%; background: linear-gradient(90deg, #4d9fff, #80b3ff);"></div>
                </div>
            </div>
        `;
    }
    
    // Level
    if (stats.level) {
        html += `
            <div class="stat-item">
                <div class="stat-label">⭐ CẤP ĐỘ</div>
                <div class="stat-value">Level ${stats.level}</div>
            </div>
        `;
    }
    
    // Strength
    if (stats.strength !== undefined) {
        html += `
            <div class="stat-item">
                <div class="stat-label">💪 SỨC MẠNH</div>
                <div class="stat-value">${stats.strength}</div>
            </div>
        `;
    }
    
    // Intelligence
    if (stats.intelligence !== undefined) {
        html += `
            <div class="stat-item">
                <div class="stat-label">🧠 TRÍ TUỆ</div>
                <div class="stat-value">${stats.intelligence}</div>
            </div>
        `;
    }
    
    // Agility/Dexterity
    if (stats.agility !== undefined || stats.dexterity !== undefined) {
        const agilityValue = stats.agility !== undefined ? stats.agility : stats.dexterity;
        html += `
            <div class="stat-item">
                <div class="stat-label">⚡ NHANH NHẸN</div>
                <div class="stat-value">${agilityValue}</div>
            </div>
        `;
    }
    
    // Gold/Money
    if (stats.gold !== undefined || stats.money !== undefined) {
        const goldValue = stats.gold !== undefined ? stats.gold : stats.money;
        html += `
            <div class="stat-item">
                <div class="stat-label">💰 VÀNG</div>
                <div class="stat-value">${goldValue}</div>
            </div>
        `;
    }
    
    // Items
    if (stats.items && stats.items.length > 0) {
        html += `
            <div class="stat-item">
                <div class="stat-label">🎒 VẬT PHẨM</div>
                <div class="stat-value" style="font-size: 10px; line-height: 1.4;">
                    ${stats.items.join(', ')}
                </div>
            </div>
        `;
    }
    
    // Companions
    if (stats.companions && stats.companions.length > 0) {
        html += `
            <div class="stat-item">
                <div class="stat-label">👥 ĐỒNG ĐỘI</div>
                <div class="stat-value" style="font-size: 10px; line-height: 1.4;">
                    ${stats.companions.join(', ')}
                </div>
            </div>
        `;
    }
    
    // Location
    if (stats.location) {
        html += `
            <div class="stat-item">
                <div class="stat-label">📍 VỊ TRÍ</div>
                <div class="stat-value" style="font-size: 11px;">${stats.location}</div>
            </div>
        `;
    }
    
    statsContainer.innerHTML = html;
}

// Extract stats from AI response
function extractStatsFromResponse(text) {
    const stats = {};
    
    // Try to extract common stat patterns
    const patterns = {
        name: /(?:Tên|Name):\s*([^\n]+)/i,
        health: /(?:HP|Health|Máu|Sức khỏe):\s*(\d+)(?:\/(\d+))?/i,
        mana: /(?:MP|Mana|Năng lượng):\s*(\d+)(?:\/(\d+))?/i,
        level: /(?:Level|Cấp độ|Lv):\s*(\d+)/i,
        strength: /(?:STR|Strength|Sức mạnh):\s*(\d+)/i,
        intelligence: /(?:INT|Intelligence|Trí tuệ):\s*(\d+)/i,
        agility: /(?:AGI|Agility|DEX|Dexterity|Nhanh nhẹn):\s*(\d+)/i,
        gold: /(?:Gold|Vàng|Tiền):\s*(\d+)/i,
        location: /(?:Vị trí|Location):\s*([^\n]+)/i
    };
    
    // Extract basic stats
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
            if (key === 'health' || key === 'mana') {
                stats[key] = parseInt(match[1]);
                if (match[2]) {
                    stats['max' + key.charAt(0).toUpperCase() + key.slice(1)] = parseInt(match[2]);
                }
            } else if (key === 'name' || key === 'location') {
                stats[key] = match[1].trim();
            } else {
                stats[key] = parseInt(match[1]);
            }
        }
    }
    
    // Extract items
    const itemsMatch = text.match(/(?:Items|Vật phẩm|Đồ):\s*([^\n]+)/i);
    if (itemsMatch) {
        stats.items = itemsMatch[1].split(',').map(item => item.trim()).filter(Boolean);
    }
    
    // Extract companions
    const companionsMatch = text.match(/(?:Companions|Đồng đội|Bạn đồng hành):\s*([^\n]+)/i);
    if (companionsMatch) {
        stats.companions = companionsMatch[1].split(',').map(comp => comp.trim()).filter(Boolean);
    }
    
    return Object.keys(stats).length > 0 ? stats : null;
}

// ---- Gemini model discovery / cache (avoid 404 wrong model ids) ----
let __geminiModelCache = null;

async function getSupportedGeminiModels(API_BASE, API_KEY) {
    if (__geminiModelCache) return __geminiModelCache;

    const preferred = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    const listUrl = `${API_BASE}/models?key=${API_KEY}`;

    try {
        const res = await fetch(listUrl, { method: 'GET' });
        if (!res.ok) throw new Error(`ListModels failed: ${res.status}`);
        const data = await res.json();

        const models = (data.models || [])
            .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => (m.name || '').replace(/^models\//, ''))
            .filter(Boolean);

        // Sort: preferred first, then the rest
        const sorted = [
            ...preferred.filter(p => models.includes(p)),
            ...models.filter(m => !preferred.includes(m))
        ];

        __geminiModelCache = sorted.length ? sorted : preferred; // fallback to preferred if empty
        return __geminiModelCache;
    } catch (e) {
        // If listing is blocked, fall back to a conservative default set.
        __geminiModelCache = preferred;
        return __geminiModelCache;
    }
}

async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Display user message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = userMessage;
    chatContent.appendChild(userBubble);

    // Clear input
    chatInput.value = '';

    // Show typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble bot typing';
    typingBubble.innerHTML = 'Đang suy nghĩ<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span>';
    typingBubble.id = 'typing-indicator';
    chatContent.appendChild(typingBubble);
    chatContent.scrollTop = chatContent.scrollHeight;

    // Resolve API key (fetch from server if not cached)
    const API_KEY = await getApiKey();
    if (!API_KEY) {
        const noKeyTyping = document.getElementById('typing-indicator');
        if (noKeyTyping) noKeyTyping.remove();
        const noKeyBubble = document.createElement('div');
        noKeyBubble.className = 'chat-bubble bot error';
        noKeyBubble.textContent = '\u26a0\ufe0f Ch\u01b0a c\u00e0i API key. Th\u00eam GEMINI_API_KEY v\u00e0o file .env r\u1ed3i kh\u1edfi \u0111\u1ed9ng l\u1ea1i app nh\u00e9!';
        chatContent.appendChild(noKeyBubble);
        chatContent.scrollTop = chatContent.scrollHeight;
        return;
    }

    try {
        const API_BASE = 'https://generativelanguage.googleapis.com/v1'; //using v1

        // --- Detect story-driven game requests ---
        const isStoryGameRequest = userMessage.toLowerCase().includes("tạo một trò chơi story driven") || 
                                   userMessage.toLowerCase().includes("bắt đầu game") ||
                                   userMessage.toLowerCase().includes("chơi game") ||
                                   userMessage.toLowerCase().includes("kể chuyện") ||
                                   userMessage.toLowerCase().includes("câu truyện") ||
                                   userMessage.toLowerCase().includes("kể cho mình") ||
                                   userMessage.toLowerCase().includes("kể một");

        const promptText = isStoryGameRequest
            ? `Bạn là một Game Master chuyên nghiệp tạo trò chơi nhập vai story-driven với hiệu ứng butterfly effect.

YÊU CẦU TẠO GAME:
- Viết bằng tiếng Việt có cảm xúc, sinh động
- Tạo MỘT CHƯƠNG ĐẦY ĐỦ với ít nhất 800-1200 từ
- Mô tả chi tiết: bối cảnh, nhân vật, không khí, cảm giác
- Phải có:
  + Phần mở đầu hấp dẫn (200-300 từ)
  + Tình huống xung đột hoặc bí ẩn
  + Thông số nhân vật chi tiết (stats, items, companions) - PHẢI HIỂN THỊ RÕ RÀNG
  + 4-5 lựa chọn tương tác CỤ THỂ (A, B, C, D, E)
  + Mỗi lựa chọn phải mô tả rõ hậu quả có thể xảy ra

FORMAT THÔNG SỐ NHÂN VẬT (BẮT BUỘC):
📊 THÔNG SỐ NHÂN VẬT:
- Tên: [Tên nhân vật]
- HP: [số hiện tại]/[số tối đa]
- Năng lượng: [số]/100
- Level: [số]
- Sức mạnh: [số]
- Trí tuệ: [số]
- Nhanh nhẹn: [số]
- Vàng: [số]
- Vật phẩm: [danh sách vật phẩm]
- Đồng đội: [danh sách đồng đội nếu có]
- Vị trí: [địa điểm hiện tại]

CHỦ ĐỀ: ${userMessage}

LƯU Ý: 
- KHÔNG viết tóm tắt, hãy viết ĐẦY ĐỦ chi tiết
- Sử dụng emoji phù hợp để tạo không khí
- Kết thúc bằng câu hỏi mở để người chơi tương tác
- Format đẹp với tiêu đề, ngắt đoạn rõ ràng
- PHẢI có phần thông số nhân vật ở đầu hoặc cuối

Hãy bắt đầu CHƯƠNG 1 ngay bây giờ!`
        : currentGameState.isPlaying 
            ? `Bạn là Game Master đang điều hành một trò chơi story-driven. Người chơi vừa đưa ra lựa chọn: "${userMessage}"

Hãy:
1. Mô tả chi tiết hậu quả của lựa chọn (300-500 từ)
2. Cập nhật thông số nhân vật nếu có thay đổi
3. Đưa ra tình huống mới và 4-5 lựa chọn tiếp theo

FORMAT THÔNG SỐ NHÂN VẬT (nếu có thay đổi):
📊 CẬP NHẬT THÔNG SỐ:
- HP: [số]/[max]
- Năng lượng: [số]/100
- Vật phẩm: [danh sách]
- Vị trí: [địa điểm]
(chỉ liệt kê những gì thay đổi)

Tiếp tục câu chuyện một cách sinh động!`
            : `Bạn là Elaina, một trợ lý AI thân thiện, dễ thương và vui vẻ, rất thích Spider-Man. Hãy trả lời ngắn gọn (tối đa 2-3 câu), dễ thương và sử dụng emoji phù hợp. Đôi khi thêm 🕸️ vào câu trả lời. 

Câu hỏi: ${userMessage}`;

        const payload = {
            contents: [ { parts: [ { text: promptText } ] } ],
            generationConfig: {
                temperature: isStoryGameRequest ? 0.85 : 0.9,
                maxOutputTokens: isStoryGameRequest ? 8192 : 2000,
                topP: 0.95,
                topK: 40 
            }
        };

        let response = null;
        let lastErrorText = '';

        // Discover supported models for THIS key/project, then try in order.
        const MODEL_CANDIDATES = await getSupportedGeminiModels(API_BASE, API_KEY);

        for (const model of MODEL_CANDIDATES) {
            const API_URL = `${API_BASE}/models/${model}:generateContent?key=${API_KEY}`;

            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) break;

            // Try next model on "not found / not supported"
            if (response.status === 404) {
                lastErrorText = await response.text().catch(() => '');
                continue;
            }

            lastErrorText = await response.text().catch(() => '');
            break;
        }

        // Remove typing indicator
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();

        if (!response || !response.ok) {
            // response body may not be JSON
            let errorJson = null;
            try { errorJson = await response.json(); } catch { /* ignore */ }
            const msg = errorJson?.error?.message || lastErrorText || 'Unknown error';
            throw new Error(`API Error: ${response ? response.status : 'NO_RESPONSE'} - ${msg}`);
        }

        const data = await response.json();

        // Extract bot response
        const botReply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Xin lỗi, mình không hiểu câu hỏi của bạn. 😅';

        // Extract and update stats if this is a game response
        if (isStoryGameRequest || currentGameState.isPlaying) {
            const extractedStats = extractStatsFromResponse(botReply);
            if (extractedStats) {
                updateStatsPanel(extractedStats);
                currentGameState.isPlaying = true;
            }
        }

        // Display bot response with typing effect
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        chatContent.appendChild(botBubble);

        // Typing effect
        let i = 0;
        const typingSpeed = 20;
        function typeWriter() {
            if (i < botReply.length) {
                botBubble.textContent += botReply.charAt(i);
                i++;
                setTimeout(typeWriter, typingSpeed);
                chatContent.scrollTop = chatContent.scrollHeight;
            }
        }
        typeWriter();

    } catch (error) {
        console.error('Error:', error);
        
        // Remove typing indicator
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();

        // Display error message
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble bot error';
        errorBubble.textContent = 'Ối! Có lỗi xảy ra rồi. Vui lòng thử lại sau nhé! 🙏';
        chatContent.appendChild(errorBubble);
    }

    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Allow Enter key to send message
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
}

// API key is injected synchronously into the page by the Python server.
// getApiKey() just reads it directly – no fetch needed.
async function getApiKey() {
    return window.GEMINI_API_KEY || '';
}