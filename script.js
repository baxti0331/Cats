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

// Твой токен бота и чат ID (замени на свои)
const TELEGRAM_BOT_TOKEN = '7855372580:AAFuZXsMBoJtcflBjH0qV9uUGdg_5i84LKo';
const TELEGRAM_CHAT_ID = '@javascriptprocets';

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
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(100,100,100,0.15)';
  // Центр лапки
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 14, 0, 0, 2 * Math.PI);
  ctx.fill();
  // Пальцы
  const offsets = [[-16,-10], [-10,-22], [10,-22], [16,-10]];
  offsets.forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.ellipse(ox, oy, 7, 10, 0, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.restore();
}

// Отправка сообщения в Telegram
function sendMessageToTelegram(username, message) {
  const text = encodeURIComponent(`Сообщение от @${username}:\n${message}`);
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${text}`;

  return fetch(url, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    if(data.ok){
      alert('Сообщение отправлено!');
    } else {
      alert('Ошибка при отправке сообщения: ' + data.description);
    }
  })
  .catch(() => alert('Ошибка сети при отправке сообщения.'));
}

// Инициализация
createBoard();
updateScoreboard();

// Работа с панелью
const sidePanel = document.getElementById('sidePanel');
const openPanelBtn = document.getElementById('openPanelBtn');
const formContainer = document.getElementById('formContainer');
const usernameInput = document.getElementById('usernameInput');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');

openPanelBtn.addEventListener('click', () => {
  sidePanel.classList.add('open');
  sidePanel.style.position = 'fixed';
  sidePanel.style.top = '0';
  sidePanel.style.left = '0';
  sidePanel.style.width = '100vw';
  sidePanel.style.height = '100vh';
  sidePanel.style.borderRadius = '0';
  sidePanel.style.background = 'rgba(255, 255, 255, 0.95)';
  sidePanel.style.boxShadow = 'none';
  openPanelBtn.style.display = 'none';
});

document.getElementById('togglePanel').remove(); // Убираем кнопку лампочки слева полностью

document.getElementById('cooperationBtn').addEventListener('click', () => {
  openForm('Сотрудничество');
});
document.getElementById('supportBtn').addEventListener('click', () => {
  openForm('Поддержка');
});

function openForm(type){
  formContainer.style.display = 'flex';
  formContainer.dataset.type = type;
  usernameInput.value = '';
  textInput.value = '';
  usernameInput.placeholder = `Ваш @username (${type})`;
  textInput.placeholder = `Сообщение для ${type.toLowerCase()}`;
  usernameInput.focus();
}

sendBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const text = textInput.value.trim();
  if(!username || !text){
    alert('Пожалуйста, заполните все поля.');
    return;
  }
  sendMessageToTelegram(username, text);
  formContainer.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  formContainer.style.display = 'none';
});
