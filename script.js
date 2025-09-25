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