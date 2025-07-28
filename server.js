const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const questions = JSON.parse(fs.readFileSync("questions.json"));
const QUESTION_COUNT = 10;

app.use(express.static("public"));

let lobbyQueue = [];
let matches = {}; // matchId -> { players: {}, currentQ, buzzed, scores, chat }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setUsername", (username) => {
    socket.username = username || "Anonymous";
    socket.emit("lobbyMessage", "Waiting for an opponent...");
    lobbyQueue.push(socket);
    tryStartMatch();
  });

  socket.on("buzz", () => {
    const match = findMatchBySocket(socket.id);
    if (!match || match.buzzed) return;
    match.buzzed = socket.id;
    io.to(match.id).emit("buzzed", socket.username);
    match.players[socket.id].socket.emit("yourTurn");
  });

  socket.on("submitAnswer", (answer) => {
    const match = findMatchBySocket(socket.id);
    if (!match || !match.buzzed || match.buzzed !== socket.id) return;

    const correct = match.questions[match.currentQ].answer.trim().toLowerCase() === answer.trim().toLowerCase();
    if (correct) match.scores[socket.id] += 1;

    io.to(match.id).emit("answerResult", {
      user: socket.username,
      answer,
      correct
    });

    match.currentQ += 1;
    match.buzzed = null;

    const winner = checkWinner(match);
    if (winner) {
      io.to(match.id).emit("gameOver", { winner: match.players[winner].username });
      cleanupMatch(match.id);
    } else if (match.currentQ >= QUESTION_COUNT) {
      declareMatchWinner(match);
    } else {
      sendNextQuestion(match);
    }
  });

  socket.on("sendMessage", (msg) => {
    const match = findMatchBySocket(socket.id);
    if (!match) return;
    io.to(match.id).emit("chat", { user: socket.username, msg });
  });

  socket.on("disconnect", () => {
    const match = findMatchBySocket(socket.id);
    if (match) {
      const opponentId = Object.keys(match.players).find(id => id !== socket.id);
      if (opponentId) {
        io.to(match.id).emit("gameOver", { winner: match.players[opponentId].username });
      }
      cleanupMatch(match.id);
    } else {
      lobbyQueue = lobbyQueue.filter(s => s.id !== socket.id);
    }
    console.log("Disconnected:", socket.id);
  });
});

function tryStartMatch() {
  while (lobbyQueue.length >= 2) {
    const p1 = lobbyQueue.shift();
    const p2 = lobbyQueue.shift();
    const matchId = `match-${uuidv4()}`;

    console.log(lobbyQueue)
    const match = {
      id: matchId,
      players: {
        [p1.id]: { socket: p1, username: p1.username },
        [p2.id]: { socket: p2, username: p2.username }
      },
      scores: { [p1.id]: 0, [p2.id]: 0 },
      currentQ: 0,
      questions: shuffleArray(questions).slice(0, QUESTION_COUNT),
      buzzed: null
    };

    matches[matchId] = match;

    p1.join(matchId);
    p2.join(matchId);

    // io.to(matchId).emit("matchStart", {
    //   opponent: {
    //     [p1.id]: match.players[p2.id].username,
    //     [p2.id]: match.players[p1.id].username
    //   }[p1.id],
    //   totalQuestions: QUESTION_COUNT
    // });

    // Send match start to player 1
    p1.emit("matchStart", {
        opponent: match.players[p2.id].username,
        totalQuestions: QUESTION_COUNT
    });
    
    // Send match start to player 2
    p2.emit("matchStart", {
        opponent: match.players[p1.id].username,
        totalQuestions: QUESTION_COUNT
    });

    sendNextQuestion(match);
  }
}

function sendNextQuestion(match) {
  const q = match.questions[match.currentQ];
  io.to(match.id).emit("newQuestion", {
    number: match.currentQ + 1,
    question: q.question
  });
}

function checkWinner(match) {
  for (const id in match.scores) {
    if (match.scores[id] > QUESTION_COUNT / 2) return id;
  }
  return null;
}

function declareMatchWinner(match) {
  const scores = match.scores;
  const winnerId = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  io.to(match.id).emit("gameOver", { winner: match.players[winnerId].username });
  cleanupMatch(match.id);
}

function cleanupMatch(id) {
  if (matches[id]) {
    Object.values(matches[id].players).forEach(({ socket }) => {
      socket.leave(id);
    });
    delete matches[id];
  }
}

function findMatchBySocket(socketId) {
  return Object.values(matches).find(m => socketId in m.players);
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
