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

function initBoard() {
  boardElement.innerHTML = '';
  for(let i=0; i<9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', cellClick);
    boardElement.appendChild(cell);
  }
}

function updateScoreboard() {
  scoreboard.textContent = `Коты 🐱: ${catWins} | Собаки 🐶: ${dogWins} | Ничьи: ${draws}`;
}

function cellClick(e) {
  if(!gameActive) return;
  const index = +e.target.dataset.index;
  if(board[index] !== '') return;
  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add('disabled');
  checkResult();
  if(gameActive) {
    currentPlayer = currentPlayer === '🐱' ? '🐶' : '🐱';
    messageElement.textContent = `Ход: ${currentPlayer}`;
  }
}

function checkResult() {
  let roundWon = false;
  for(const condition of winningConditions) {
    const [a,b,c] = condition;
    if(board[a] && board[a] === board[b] && board[b] === board[c]) {
      roundWon = true;
      highlightWinningCells(condition);
      break;
    }
  }
  if(roundWon) {
    gameActive = false;
    if(currentPlayer === '🐱') {
      catWins++;
      messageElement.textContent = 'Победили Коты! 🐱';
    } else {
      dogWins++;
      messageElement.textContent = 'Победили Собаки! 🐶';
    }
    updateScoreboard();
    return;
  }
  if(!board.includes('')) {
    draws++;
    gameActive = false;
    messageElement.textContent = 'Ничья!';
    updateScoreboard();
    return;
  }
}

function highlightWinningCells(cells) {
  cells.forEach(i => {
    boardElement.children[i].style.backgroundColor = '#90ee90';
  });
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = '🐱';
  gameActive = true;
  messageElement.textContent = `Ход: ${currentPlayer}`;
  initBoard();
}

// --- Форма поддержки и сотрудничества ---

const formContainer = document.getElementById('formContainer');
const usernameInput = document.getElementById('usernameInput');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');

function openForm(type) {
  formContainer.style.display = 'flex';
  usernameInput.value = '';
  textInput.value = '';
  usernameInput.focus();
  messageElement.textContent = `Форма: ${type}`;
  formContainer.dataset.type = type;
}

function closeForm() {
  formContainer.style.display = 'none';
  if(gameActive) {
    messageElement.textContent = `Ход: ${currentPlayer}`;
  }
}

// Открываем форму из кнопок (тебе нужно эти кнопки реализовать в HTML и повесить вызов openForm('Поддержка') или openForm('Сотрудничество'))
// Например:
document.getElementById('supportBtn').addEventListener('click', () => openForm('Поддержка'));
document.getElementById('cooperationBtn').addEventListener('click', () => openForm('Сотрудничество'));

sendBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const message = textInput.value.trim();
  if(!username || !message) {
    alert('Пожалуйста, заполните все поля');
    return;
  }
  
  // Вставь сюда свой Telegram токен и чат ID
  const telegramToken = '7855372580:AAFuZXsMBoJtcflBjH0qV9uUGdg_5i84LKo';
  const chatId = '@javascriptprocets';

  const text = encodeURIComponent(`Тип: ${formContainer.dataset.type}\nПользователь: ${username}\nСообщение: ${message}`);

  fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${chatId}&text=${text}`)
    .then(response => {
      if(response.ok) {
        alert('Сообщение успешно отправлено!');
        closeForm();
      } else {
        alert('Ошибка при отправке сообщения');
      }
    })
    .catch(() => alert('Ошибка сети. Попробуйте еще раз.'));
});

cancelBtn.addEventListener('click', () => {
  closeForm();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && formContainer.style.display === 'flex') {
    closeForm();
  }
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

boardElement.addEventListener('click', (e) => {
  if(!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  drawPaw(x, y);
});

function drawPaw(x, y) {
  const radius = 15;
  ctx.fillStyle = currentPlayer === '🐱' ? '#6a994e' : '#d62828';
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  for(let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i - Math.PI / 4;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * radius * 1.4,
      y + Math.sin(angle) * radius * 1.4,
      radius * 0.6,
      radius * 0.4,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 700);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Инициализация игры
initBoard();
updateScoreboard();
