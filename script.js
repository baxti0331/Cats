const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const scoreboard = document.getElementById('scoreboard');
const canvas = document.getElementById('pawCanvas');
const ctx = canvas.getContext('2d');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = '🐱';
let gameActive = true;
let catWins = 0;
let dogWins = 0;
let draws = 0;

const winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.dataset.index = index;
    cellDiv.textContent = cell;
    if(cell !== '') cellDiv.classList.add('disabled');
    cellDiv.addEventListener('click', onCellClick);
    boardElement.appendChild(cellDiv);
  });
}

function onCellClick(e) {
  const index = e.target.dataset.index;
  if(!gameActive || board[index] !== '' || currentPlayer !== '🐱') return;
  board[index] = '🐱';
  updateBoard();
  checkResult();
  if(gameActive) setTimeout(botMove, 500);
}

function updateBoard() {
  document.querySelectorAll('.cell').forEach(cell => {
    const idx = cell.dataset.index;
    cell.textContent = board[idx];
    if(board[idx] !== '') cell.classList.add('disabled');
    else cell.classList.remove('disabled');
  });
}

function updateScoreboard() {
  scoreboard.textContent = `Коты 🐱: ${catWins} | Собаки 🐶: ${dogWins} | Ничьи: ${draws}`;
}

function checkResult() {
  for(const condition of winningConditions){
    const [a,b,c] = condition;
    if(board[a] && board[a] === board[b] && board[b] === board[c]){
      gameActive = false;
      highlightWin([a,b,c]);
      showPawPrints();
      messageElement.textContent = board[a] === '🐱' ? 'Коты победили! 🐱🎉' : 'Собаки победили! 🐶🎉';
      board[a] === '🐱' ? catWins++ : dogWins++;
      updateScoreboard();
      setTimeout(restartGame, 2500);
      return;
    }
  }
  if(!board.includes('')){
    gameActive = false;
    draws++;
    updateScoreboard();
    messageElement.textContent = 'Ничья! 🤝';
    setTimeout(restartGame, 2500);
    return;
  }
  currentPlayer = currentPlayer === '🐱' ? '🐶' : '🐱';
  messageElement.textContent = `Ход: ${currentPlayer}`;
}

function highlightWin(indices){
  indices.forEach(i => {
    document.querySelector(`.cell[data-index="${i}"]`).style.background = '#b2f7ef';
  });
}

function restartGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = '🐱';
  gameActive = true;
  createBoard();
  messageElement.textContent = `Ход: ${currentPlayer}`;
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function botMove() {
  if (!gameActive) return;
  const chance = Math.random();
  if (chance < 0.85) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = '🐶';
        let score = minimax(board, 0, false);
        board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    board[move] = '🐶';
  } else {
    const available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
    const move = available[Math.floor(Math.random() * available.length)];
    board[move] = '🐶';
  }
  updateBoard();
  checkResult();
}

function minimax(newBoard, depth, isMaximizing) {
  const winner = checkWinner(newBoard);
  if(winner) return winner === '🐶' ? 10 - depth : winner === '🐱' ? depth - 10 : 0;
  if(isMaximizing){
    let best = -Infinity;
    for(let i=0; i<newBoard.length; i++){
      if(newBoard[i] === ''){
        newBoard[i] = '🐶';
        best = Math.max(best, minimax(newBoard, depth+1, false));
        newBoard[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for(let i=0; i<newBoard.length; i++){
      if(newBoard[i] === ''){
        newBoard[i] = '🐱';
        best = Math.min(best, minimax(newBoard, depth+1, true));
        newBoard[i] = '';
      }
    }
    return best;
  }
}

function checkWinner(bd) {
  for(const [a,b,c] of winningConditions){
    if(bd[a] && bd[a] === bd[b] && bd[b] === bd[c]) return bd[a];
  }
  return bd.includes('') ? null : 'tie';
}

function showPawPrints(){
  for(let i=0; i<50; i++){
    const x = Math.random()*canvas.width;
    const y = Math.random()*canvas.height;
    drawPaw(x, y);
  }
}

function drawPaw(x, y){
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2*Math.PI);
  ctx.arc(x-8, y-8, 4, 0, 2*Math.PI);
  ctx.arc(x+8, y-8, 4, 0, 2*Math.PI);
  ctx.arc(x-5, y+8, 4, 0, 2*Math.PI);
  ctx.arc(x+5, y+8, 4, 0, 2*Math.PI);
  ctx.fill();
  ctx.restore();
}

// Боковая панель и форма
const sidePanel = document.getElementById('sidePanel');
const togglePanel = document.getElementById('togglePanel');
const cooperationBtn = document.getElementById('cooperationBtn');
const supportBtn = document.getElementById('supportBtn');
const formContainer = document.getElementById('formContainer');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const usernameInput = document.getElementById('usernameInput');
const textInput = document.getElementById('textInput');

let currentTopic = '';

togglePanel.addEventListener('click', () => {
  if(sidePanel.style.left === '0px'){
    sidePanel.style.left = '-100%';
  } else {
    sidePanel.style.left = '0';
    sidePanel.style.width = '100%';
  }
});

cooperationBtn.addEventListener('click', () => {
  currentTopic = 'Сотрудничество';
  openForm();
});

supportBtn.addEventListener('click', () => {
  currentTopic = 'Поддержка';
  openForm();
});

cancelBtn.addEventListener('click', () => {
  closeForm();
});

sendBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const text = textInput.value.trim();
  if (!username || !text) {
    alert('Заполните все поля!');
    return;
  }

  const botToken = 'ТВОЙ_ТОКЕН_БОТА';  // <-- ЗАМЕНИ СВОИ
  const chatId = 'ТВОЙ_CHAT_ID';       // <-- ЗАМЕНИ СВОИМ

  const message = `📨 Новое сообщение:\nТема: ${currentTopic}\n👤 Пользователь: ${username}\n💬 Текст: ${text}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      alert('Сообщение отправлено!');
      closeForm();
    } else {
      alert('Ошибка отправки.');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Ошибка сети.');
  });
});

function openForm() {
  formContainer.style.display = 'flex';
  usernameInput.value = '';
  textInput.value = '';
}

function closeForm() {
  formContainer.style.display = 'none';
}

createBoard();
