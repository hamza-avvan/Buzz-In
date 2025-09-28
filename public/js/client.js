const socket = io();
let buzzed = false;

let currentUsername = "";

// Add these variables at the top of client.js
let playerStats = {
    totalQuestions: 0,
    completed: 0,
    correct: 0,
    score: 0
  };
  
  let opponentStats = {
    totalQuestions: 0,
    completed: 0,
    correct: 0,
    score: 0
  };
  
  // Update the matchStart handler
  socket.on("matchStart", (data) => {
    playStartSound();
    
    
    console.log(data)
    document.getElementById("status").innerText = "Match started vs " + data.opponent;
    document.getElementById("statsArea").style.display = "block";
    
    document.getElementById("preloader").style.display = "none";
    $(".avatarSection").removeClass('hide');

    $(".progress").remove()
    $(".stats-value").removeClass('hide')


    // Set opponent info
    document.getElementById("opponentName").innerText = data.opponent;
    document.getElementById("opponentAvatar").src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(data.opponent)}&radius=50&size=50`;
    
    // Reset stats
    resetStats();
  });
  
  function resetStats() {
    playerStats = { totalQuestions: 10, completed: 0, correct: 0, score: 0 };
    opponentStats = { totalQuestions: 10, completed: 0, correct: 0, score: 0 };
    updateStatsDisplay();
  }
  
  function updateStatsDisplay() {
    // Player stats
    document.getElementById("playerTotalQ").innerText = playerStats.totalQuestions;
    document.getElementById("playerCompleted").innerText = playerStats.completed;
    document.getElementById("playerCorrect").innerText = playerStats.correct;
    document.getElementById("playerScore").innerText = playerStats.score;
    
    // Opponent stats
    document.getElementById("opponentTotalQ").innerText = opponentStats.totalQuestions;
    document.getElementById("opponentCompleted").innerText = opponentStats.completed;
    document.getElementById("opponentCorrect").innerText = opponentStats.correct;
    document.getElementById("opponentScore").innerText = opponentStats.score;
  }
  
  // Update the answerResult handler
  socket.on("answerResult", (data) => {
    document.getElementById("result").innerText = `${data.user} answered "${data.answer}" - ${data.correct ? "Correct!" : "Wrong!"}`;
    
    if (data.user === currentUsername) {
      playerStats.completed++;
      if (data.correct) {
        playerStats.correct++;
        playerStats.score++;
        playCorrectSound();
      } else {
        playWrongSound();
      }
    } else {
      opponentStats.completed++;
      if (data.correct) {
        opponentStats.correct++;
        opponentStats.score++;
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
    
    updateStatsDisplay();
  });
  
  // Update the login function to hide stats area initially
  function login() {
    const username = document.getElementById("username").value.trim();
    if (!username) return M.toast({ html: "Please enter your name", classes: "red" });
  
    currentUsername = username;
    socket.emit("setUsername", username);

    
    // Set player info
    document.getElementById("playerName").innerText = username;
    document.getElementById("playerAvatar").src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(username)}&radius=50&size=50`;
    
  
    document.getElementById("loginArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("statsArea").style.display = "block"; // Hide stats until match starts
    document.getElementById("status").innerText = "Waiting for opponent...";
  }

function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (msg) {
    socket.emit("sendMessage", msg);
    input.value = "";
  }
}

socket.on("chat", (data) => {
    const chatBox = document.getElementById("chatBox");
    const message = document.createElement("div");
    
    // Add class based on who sent the message
    const isOurMessage = data.user === currentUsername;
    message.classList.add("chat-message", isOurMessage ? "ours" : "theirs");
  
    const avatar = document.createElement("img");
    avatar.src = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(data.user)}&radius=50&size=48`;
    avatar.classList.add("avatar");

    if (data.user !== currentUsername) {
        playMessageSound();
        M.toast({ html: `${data.user} sent you a message` })
    }
  
    const content = document.createElement("div");
    content.classList.add("chat-content");
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    content.innerHTML = `
      <strong>${data.user}</strong>
      <span class="time">${timeString}</span><br>
      ${data.msg}
    `;
  
    message.appendChild(avatar);
    message.appendChild(content);
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

function quitGame() {
  window.onbeforeunload = null;
  const sure = confirm("Are you sure you want to reload? You'll lose the session and the match.");
  if (sure) {
    socket.disconnect();
    location.reload();
  } 
}

// Receive lobby message
socket.on("lobbyMessage", (msg) => {
  document.getElementById("status").innerText = msg;
});


// New question received
socket.on("newQuestion", (data) => {
  document.getElementById("question").innerText = `Q${data.number}: ${data.question}`;
  document.getElementById("answerArea").style.display = "none";
  document.getElementById("result").innerText = "";
  buzzed = false;
});

// Someone buzzed in
socket.on("buzzed", (name) => {
  document.getElementById("result").innerText = `${(name!=currentUsername ? `${name} buzzed!` : "🎉You buzzed first!")}`;

  if (name != currentUsername) {
    playBuzzSound()
    M.toast({ html: `${name}🐝 buzzed before you. Better luck next time`, classes: "orange" })
  }
});

// It's your turn to answer
socket.on("yourTurn", () => {
  document.getElementById("answerArea").style.display = "block";
});

// Game over
socket.on("gameOver", (data) => {
  if (data.winner==currentUsername) {
    data.winner = 'You'
    confettiRain()
    playWinSound()
  } else {
    playLoseSound()
  }

  currentUsername = "";
  document.getElementById("status").innerText = `Game Over! Winner: ${data.winner}`;
  document.getElementById("answerArea").style.display = "none";

  window.onbeforeunload = null;

  setTimeout(function() {
    location.reload()
  }, 15000)
});

// Buzz button click
function buzz() {
  if (!buzzed) {
    socket.emit("buzz");
    buzzed = true;
  }
};

// Submit answer button
function submitAnswer() {
  const answer = document.getElementById("answerInput").value.trim();
  if (answer !== "") {
    socket.emit("submitAnswer", answer);
    document.getElementById("answerInput").value = "";
    document.getElementById("answerArea").style.display = "none";
  }
}

  // Handle pressing Enter key to trigger login
  function loginOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      login();
    }
  }

  function sendMessageOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChat();
    }
  }


  function submitAnswerOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitAnswer();
    }
  }

  // Sound functions
function playMessageSound() {
    const sound = document.getElementById('messageSound');
    sound.currentTime = 0; // Rewind to start
    sound.play().catch(e => console.log("Audio play failed:", e));
}

function playCorrectSound() {
    const sound = document.getElementById('correctSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

function playStartSound() {
    const sound = document.getElementById('startSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

function playWrongSound() {
  const sound = document.getElementById('wrongSound');
  sound.currentTime = 0;
  sound.play().catch(e => console.log("Audio play failed:", e));
}

function playBuzzSound() {
  const sound = document.getElementById('buzzSound');
  sound.currentTime = 0;
  sound.play().catch(e => console.log("Audio play failed:", e));
}

function playWinSound() {
    const sound = document.getElementById('winSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

function playLoseSound() {
    const sound = document.getElementById('loseSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

const myCanvas = document.createElement('canvas');
myCanvas.style.position = 'fixed';
myCanvas.style.top = '0';
myCanvas.style.left = '0';
myCanvas.style.width = '100%';
myCanvas.style.height = '100%';
myCanvas.style.pointerEvents = 'none'; // so it doesn't block clicks
myCanvas.style.zIndex = '9999';
document.body.appendChild(myCanvas);

const confettiInstance = confetti.create(myCanvas, {
  resize: true,   // make it full-screen & auto-resize
  useWorker: true // better performance
});

function confettiRain() {
  const duration = 5 * 1000; // how long to keep spawning
  const animationEnd = Date.now() + duration;

  (function frame() {
    confettiInstance({
      particleCount: 5,
      angle: 90,             // straight down
      spread: 45,
      startVelocity: 30,
      gravity: 0.8,          // slower fall (default 1)
      ticks: 400,            // live longer
      shapes: ['square'],    // looks more like ribbons
      scalar: 1.2,           // a bit bigger
      origin: { x: Math.random(), y: 0 }
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  }());
}

window.onbeforeunload = function() {
  return "You'll lose the session and the match, are you sure?";
};

// Emoji Picker Initialization
// const picker = new EmojiButton({
//     position: 'top-end',
//     theme: 'light',
//     emojiSize: '1.2em'
//   });
  
//   const emojiTrigger = document.querySelector('#emojiBtn');
//   const chatInput = document.querySelector('#chatInput');
  
//   picker.on('emoji', emoji => {
//     chatInput.value += emoji;
//   });
  
//   emojiTrigger.addEventListener('click', () => {
//     picker.togglePicker(emojiTrigger);
//   });
