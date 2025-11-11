// Seleção de elementos
const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const status = document.getElementById("status");
const speedRange = document.getElementById("speedRange");
const startButton = document.getElementById("startButton");
const jumpButton = document.getElementById("jumpButton");
const timeDisplay = document.getElementById("time");
const scoreDisplay = document.getElementById("score");
const gameContainer = document.getElementById("game");

// Variáveis de controle
let gameInterval, timeInterval;
let speed = 2000;
const speedIncrement = 50;
const minSpeed = 500;

let time = 0;
let score = 0;
let highScore = 0;
let passedObstacle = false;
let gameStarted = false;
let isJumping = false;

// ---------------------- FUNÇÃO DE PULO ----------------------
function jump() {
    // só pula se o jogo começou e não estiver pulando
    if (!gameStarted || isJumping) return;

    isJumping = true;
    dino.classList.add("jump");
    console.log("Pulando...");

    // tempo de subida + descida = 800ms
    setTimeout(() => {
        dino.classList.remove("jump");
        isJumping = false;
    }, 800);
}

// ---------------------- MOVIMENTO DO CACTO ----------------------
function moveCactus() {
    if (!gameStarted) return;

    cactus.style.transition = "none";
    cactus.style.left = "100%";

    // forçar reflow para reiniciar animação
    void cactus.offsetWidth;

    cactus.style.transition = `left ${speed}ms linear`;
    cactus.style.left = "-60px";
    passedObstacle = false;
}

// ---------------------- COLISÃO ----------------------
function checkCollision() {
    if (!gameStarted) return;

    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    // coordenadas relativas
    const dinoPos = {
        left: dinoRect.left - gameRect.left,
        right: dinoRect.right - gameRect.left,
        top: dinoRect.top - gameRect.top,
        bottom: dinoRect.bottom - gameRect.top
    };

    const cactusPos = {
        left: cactusRect.left - gameRect.left,
        right: cactusRect.right - gameRect.left,
        top: cactusRect.top - gameRect.top,
        bottom: cactusRect.bottom - gameRect.top
    };

    const collision =
        cactusPos.left < dinoPos.right - 10 &&
        cactusPos.right > dinoPos.left + 10 &&
        cactusPos.bottom > dinoPos.top &&
        cactusPos.top < dinoPos.bottom;

    if (collision) {
        endGame();
        return;
    }

    // passou o obstáculo
    if (cactusPos.right < dinoPos.left && !passedObstacle) {
        passedObstacle = true;
        score += 2;
        scoreDisplay.textContent = score;

        // aumenta velocidade
        speed = Math.max(minSpeed, speed - speedIncrement);
        setTimeout(moveCactus, 100);
    }
}

// ---------------------- INÍCIO DO JOGO ----------------------
function startGame() {
    status.innerHTML = "";
    startButton.style.display = "none";
    gameStarted = true;
    isJumping = false;
    time = 0;
    score = 0;
    timeDisplay.textContent = time;
    scoreDisplay.textContent = score;

    // reset visuais
    dino.style.bottom = "0px";
    cactus.style.left = "100%";
    dino.classList.remove("jump");

    // configura velocidade
    speed = 2000 - (speedRange.value - 1) * 150;
    speed = Math.max(minSpeed, speed);

    moveCactus();

    // cronômetro
    timeInterval = setInterval(() => {
        if (gameStarted) {
            time++;
            timeDisplay.textContent = time;
        }
    }, 1000);

    // loop de colisão
    gameInterval = setInterval(checkCollision, 30);
}

// ---------------------- FIM DO JOGO ----------------------
function endGame() {
    gameStarted = false;
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    cactus.style.transition = "none";

    if (score > highScore) highScore = score;

    status.innerHTML = `
        <div class="game-over">
            Ops! Você perdeu!<br>
            Tempo: ${time}s | Pontos: ${score}<br>
            Recorde: ${highScore}<br>
            Clique em "Reiniciar" para tentar de novo.
        </div>
        <button id="restartButton">Reiniciar</button>
    `;

    document.getElementById("restartButton").addEventListener("click", resetGame);
}

// ---------------------- RESET ----------------------
function resetGame() {
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    gameStarted = false;
    isJumping = false;
    passedObstacle = false;

    startButton.style.display = "block";
    status.innerHTML = "";

    dino.style.bottom = "0px";
    cactus.style.left = "100%";
    dino.classList.remove("jump");
}

// ---------------------- CONTROLES ----------------------
startButton.addEventListener("click", startGame);

// clique
jumpButton.addEventListener("click", jump);

// toque (celular)
jumpButton.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

// toque em qualquer parte do jogo
gameContainer.addEventListener("touchstart", e => {
    if (gameStarted) {
        e.preventDefault();
        jump();
    }
});

// teclado
document.addEventListener("keydown", e => {
    if (["Space", "ArrowUp", "KeyW"].includes(e.code) && gameStarted) {
        e.preventDefault();
        jump();
    }
});

// evitar scroll ao tocar
gameContainer.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// inicialização
resetGame();
