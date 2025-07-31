🎮 Quiz Show Game - Complete Documentation
==========================================

📋 Table of Contents
--------------------

1.  [Project Overview](#-project-overview)
2.  [Features](#-features)
3.  [Installation](#-installation)
4.  [Gameplay](#-gameplay)
5.  [Technical Architecture](#-architecture)
6.  [Customization](#-customization)
7.  [Troubleshooting](#-troubleshooting)
8.  [License](#-license)
9.  [Documentaiton](https://html-preview.github.io/?url=https://github.com/hamza-avvan/Buzz-In/blob/main/docs/README.html)

🌟 Project Overview
-------------------

Real-time multiplayer quiz game with buzzer system built with:



🚀 Features
-----------

*   **Real-time Buzzer** 🎛️
*   **Interactive Chat** 💬
*   **Score Tracking** 📊
*   **Sound Effects** 🔊
*   **Responsive Design** 📱
*   **DiceBear API Avatars** 👤


🛠️ Installation
----------------

### Requirements

*   Node.js 14+
*   npm 6+

### Steps

    # 1. Clone repository
    git clone https://github.com/your-repo/quiz-show.git
    cd quiz-show
    
    # 2. Install dependencies
    npm install
    
    # 3. Add sound files (optional)
    mkdir -p public/sounds
    cp path/to/sounds/* public/sounds/
    
    # 4. Start server
    node server.js

🎮 Gameplay
-----------

### 1\. Player Login

Enter username to join lobby

_Image placeholder: Login Screen_

### 2\. Buzzer Round

*   First to buzz answers
*   15 second time limit
```js
    function buzz() {
        socket.emit('buzz');
    }
```

### 3\. Scoring

| Outcome  | Points |
| -------- | ------ |
| Correct  | +1     |
| Wrong    | 0      |

🖥️ Technical Architecture
--------------------------

### File Structure
```
/public
  /css
    style.css
  /js
    client.js
  /lib
  /img
  /sounds
  /index.html
/package-lock.json
/package.json
/questions.json
/server.js
```

🎨 Customization
----------------

### Change Questions

Edit `questions.json`:
```json
    [
        {
            "question": "Your question here?",
            "answer": "Correct answer"
        }
    ]
```

🐛 Troubleshooting
------------------
| Issue                 | Solution                         |
| --------------------- | -------------------------------- |
| Connection fails      | Ensure server is running         |
| Sounds not playing    | Check browser console for errors |
| Mobile display issues | Add viewport meta tag            |


📜 License
----------

MIT License - Free for personal and educational use