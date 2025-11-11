const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const recordEl = document.getElementById("record");
const statusEl = document.getElementById("status");
const startButton = document.getElementById("startButton");
const speedRange = document.getElementById("speedRange");

let jumping = false;
let ducking = false;
let isGameOver = false;
let score = 0;
let record = 0;
let time = 0;
let baseSpeed = 5;
let gameInterval, timeInterval;
let cactusLeft = 800;

// Sons
const jumpSound = new Audio("jump.mp3");
const hitSound = new Audio("hit.mp3");
jumpSound.volume = 0.6;
hitSound.volume = 0.8;

function startGame() {
  clearInterval(gameInterval);
  clearInterval(timeInterval);
  cactusLeft = 800;
  isGameOver = false;
  score = 0;
  time = 0;
  baseSpeed = parseInt(speedRange.value);
  scoreEl.textContent = "0";
  timeEl.textContent = "0";
  statusEl.textContent = "";
  cactus.style.left = "800px";
  gameInterval = setInterval(moveCactus, 10);
  timeInterval = setInterval(() => timeEl.textContent = ++time, 900);
}

function jump() {
  if (jumping || ducking || isGameOver) return;
  jumping = true;
  dino.style.animation = "jump 0.7s ease";
  jumpSound.currentTime = 0;
  jumpSound.play();
  setTimeout(() => {
    dino.style.animation = "none";
    jumping = false;
    dino.style.bottom = "-30px"; 
  }, 700);
}

function duck() {
  if (ducking || jumping || isGameOver) return;
  ducking = true;
  dino.classList.add("duck");
  setTimeout(() => {
    dino.classList.remove("duck");
    ducking = false;
  }, 700);
}

function moveCactus() {
  cactusLeft -= baseSpeed;
  cactus.style.left = cactusLeft + "px";

  if (cactusLeft < -100) {
    cactusLeft = 800;

    if (Math.random() > 0.6 && score >= 30) {
      cactus.style.bottom = "45px";
    } else {
      cactus.style.bottom = "0px";
    }

    score += 3;
    scoreEl.textContent = score;
    if (score > record) {
      record = score;
      recordEl.textContent = record;
    }

    if (score % 30 === 0) baseSpeed += 0.5;
  }

  checkCollision();
}

function checkCollision() {
  const dinoRect = dino.getBoundingClientRect();
  const cactusRect = cactus.getBoundingClientRect();

  const dinoHit = {
    top: dinoRect.top + dinoRect.height * 0.3,
    bottom: dinoRect.bottom - dinoRect.height * 0.05,
    left: dinoRect.left + dinoRect.width * 0.2,
    right: dinoRect.right - dinoRect.width * 0.2
  };

  const cactusHit = {
    top: cactusRect.top + cactusRect.height * 0.2,
    bottom: cactusRect.bottom - cactusRect.height * 0.2,
    left: cactusRect.left + cactusRect.width * 0.2,
    right: cactusRect.right - cactusRect.width * 0.2
  };

  const overlap = !(
    dinoHit.top > cactusHit.bottom ||
    dinoHit.bottom < cactusHit.top ||
    dinoHit.right < cactusHit.left ||
    dinoHit.left > cactusHit.right
  );

  if (overlap) gameOver();
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(timeInterval);
  hitSound.currentTime = 0;
  hitSound.play();
  statusEl.textContent = `💀 Game Over! Pontuação final: ${score}`;
}

// Botões
document.getElementById("jumpButton").addEventListener("click", jump);
document.getElementById("duckButton").addEventListener("click", duck);
startButton.addEventListener("click", startGame);

// Teclado
document.addEventListener("keydown", e => {
  if ((e.code === "Space" || e.code === "ArrowUp")) {
    e.preventDefault();
    if (!gameInterval && isGameOver === false && score === 0) startGame();
    jump();
  } else if (e.code === "ArrowDown") {
    e.preventDefault();
    duck();
  }
});

// Mobile - deslizar pra cima/baixo
let touchStartY = 0;
document.addEventListener("touchstart", e => {
  touchStartY = e.touches[0].clientY;
});
document.addEventListener("touchend", e => {
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  if (deltaY < -40) jump();
  else if (deltaY > 40) duck();
});
