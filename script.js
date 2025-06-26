const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const scoreboard = document.getElementById('scoreboard');
const canvas = document.getElementById('pawCanvas');
const ctx = canvas.getContext('2d');

const sidePanel = document.getElementById('sidePanel');
const openPanelBtn = document.getElementById('openPanelBtn');

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
  if(winner !== null) {
    if(winner === '🐶') return 10 - depth;
    else if(winner === '🐱') return depth - 10;
    else return 0;
  }
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

function checkWinner(boardToCheck) {
  for(const condition of winningConditions){
    const [a,b,c] = condition;
    if(boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[b] === boardToCheck[c]){
      return boardToCheck[a];
    }
  }
  if(!boardToCheck.includes('')) return 'draw';
  return null;
}

function showPawPrints() {
  // Простая анимация лапок — просто кружки, чтобы не перегружать код
  let x = 20;
  let y = 20;
  let count = 0;
  const interval = setInterval(() => {
    ctx.fillStyle = count % 2 === 0 ? 'rgba(144,238,144,0.7)' : 'rgba(60,179,113,0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI*2);
    ctx.fill();
    x += 40;
    if(x > canvas.width - 20){
      x = 20;
      y += 40;
    }
    count++;
    if(count > 30){
      clearInterval(interval);
    }
  }, 100);
}

// Меню и панель
openPanelBtn.addEventListener('click', () => {
  if(sidePanel.classList.contains('open')){
    sidePanel.classList.remove('open');
  } else {
    sidePanel.classList.add('open');
  }
});

// Инициализация
createBoard();
updateScoreboard();

// Отправка формы (пример отправки в Telegram через fetch)
const formContainer = document.getElementById('formContainer');
const cooperationBtn = document.getElementById('cooperationBtn');
const supportBtn = document.getElementById('supportBtn');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const usernameInput = document.getElementById('usernameInput');
const textInput = document.getElementById('textInput');

function openForm() {
  formContainer.style.display = 'flex';
  sidePanel.classList.remove('open');
}

function closeForm() {
  formContainer.style.display = 'none';
  usernameInput.value = '';
  textInput.value = '';
}

cooperationBtn.addEventListener('click', openForm);
supportBtn.addEventListener('click', openForm);

sendBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const message = textInput.value.trim();
  if(!username || !message){
    alert('Пожалуйста, заполните оба поля');
    return;
  }

  // Пример запроса для Telegram Bot API (замени YOUR_BOT_TOKEN и CHAT_ID)
  const token = 'YOUR_BOT_TOKEN';
  const chatId = 'CHAT_ID';
  const text = `Сообщение от ${username}:\n${message}`;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  })
  .then(response => {
    if(response.ok){
      alert('Сообщение отправлено!');
      closeForm();
    } else {
      alert('Ошибка при отправке сообщения');
    }
  })
  .catch(() => alert('Ошибка сети'));
});

cancelBtn.addEventListener('click', closeForm);