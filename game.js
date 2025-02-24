$(document).ready(function() {
  const words = {
    "fruits": [
      "apple", "banana", "pear", "cherry", "strawberry",
      "mango", "watermelon", "melon", "pineapple", "blueberry",
      "orange", "lemon", "coconut", "kiwi", "grape",
      "papaya", "passionfruit", "pomegranate", "apricot", "guava"
    ],
    "animals": [
      "dog", "cat", "lion", "tiger", "elephant",
      "giraffe", "zebra", "monkey", "bear", "wolf",
      "fox", "rabbit", "deer", "horse", "cow",
      "sheep", "goat", "kangaroo", "panda", "leopard"
    ],
    "instruments": [
      "guitar", "piano", "violin", "drums", "flute",
      "saxophone", "trumpet", "cello", "harp", "clarinet",
      "trombone", "bass", "oboe", "accordion", "banjo",
      "mandolin", "ukelele", "organ", "synthesizer", "xylophone"
    ],
    "vegetables": [
      "carrot", "potato", "tomato", "cucumber", "lettuce",
      "spinach", "broccoli", "cauliflower", "pepper", "onion",
      "garlic", "zucchini", "eggplant", "cabbage", "radish",
      "beetroot", "pea", "corn", "celery", "asparagus"
    ],
    "sports": [
      "soccer", "basketball", "baseball", "tennis", "golf",
      "swimming", "running", "cycling", "volleyball", "rugby",
      "hockey", "boxing", "badminton", "cricket", "skiing",
      "surfing", "skateboarding", "table tennis", "martial arts", "fencing"
    ]
  };

  // Variables globales para la palabra a adivinar
  let currentCategory;
  let currentWord;
  // Para almacenar las respuestas ya dadas por la máquina (sin repetir)
  let machineGuesses = [];
  let machineInterval;

  const $mainCanvas = $("#main-canvas");
  const mainCanvas = $mainCanvas[0];
  const context = mainCanvas.getContext("2d");

  let initialX;
  let initialY;
  let currentLineWidth = 2;
  let currentStrokeStyle = "#000";
  let gameActive = true;
  let timeLeft = 30;
  let timerInterval;

  // Función que devuelve la posición relativa en el canvas
  const getPosicionCanvas = function(evt) {
    const rect = mainCanvas.getBoundingClientRect();
    let x, y;
    if (evt.originalEvent.changedTouches) {
      x = evt.originalEvent.changedTouches[0].clientX - rect.left;
      y = evt.originalEvent.changedTouches[0].clientY - rect.top;
    } else {
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
    }
    x *= mainCanvas.width / rect.width;
    y *= mainCanvas.height / rect.height;
    return { x, y };
  };

  // Función para dibujar en el canvas
  const dibujar = function(cursorX, cursorY) {
    context.beginPath();
    context.moveTo(initialX, initialY);
    context.lineWidth = currentLineWidth;
    context.strokeStyle = currentStrokeStyle;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(cursorX, cursorY);
    context.stroke();
    initialX = cursorX;
    initialY = cursorY;
  };

  // Funciones para manejar el dibujo con ratón/táctil
  const mouseDown = function(evt) {
    if (!gameActive) return;
    evt.preventDefault();
    const pos = getPosicionCanvas(evt);
    initialX = pos.x;
    initialY = pos.y;
    dibujar(initialX, initialY);
    $mainCanvas.on("mousemove touchmove", mouseMoving);
  };

  const mouseMoving = function(evt) {
    if (!gameActive) return;
    evt.preventDefault();
    const pos = getPosicionCanvas(evt);
    dibujar(pos.x, pos.y);
  };

  const mouseUp = function(evt) {
    evt.preventDefault();
    $mainCanvas.off("mousemove touchmove", mouseMoving);
  };

  // Función para vincular los eventos de dibujo
  function bindCanvasEvents() {
    $mainCanvas.on("mousedown touchstart", mouseDown);
    $mainCanvas.on("mouseup touchend", mouseUp);
  }
  bindCanvasEvents();

  // Botones para limpiar el canvas y cambiar el grosor/color
  $("#cleanboard").on("click", function() {
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  });

  $("#thinline").on("click", function() {
    currentLineWidth = 2;
  });
  $("#mediumline").on("click", function() {
    currentLineWidth = 4;
  });
  $("#thickline").on("click", function() {
    currentLineWidth = 6;
  });

  $(".color").on("click", function() {
    const bgColor = $(this).css("background-color");
    currentStrokeStyle = bgColor;
  });

  // Función para asignar una palabra aleatoria a #word y almacenar su categoría
  function setRandomWord() {
    const categories = Object.keys(words);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomIndex = Math.floor(Math.random() * words[randomCategory].length);
    const randomWord = words[randomCategory][randomIndex];
    currentCategory = randomCategory;
    currentWord = randomWord.toUpperCase();
    $("#word").text(currentWord);
    machineGuesses = []; // reiniciamos las respuestas de la máquina
  }
  // Asignamos la palabra aleatoria al inicio
  setRandomWord();

  // Función que realiza la respuesta de la máquina cada 3 segundos
  function machineGuess() {
    if (!gameActive) {
      clearInterval(machineInterval);
      return;
    }
    // Filtramos las palabras de la categoría que aún no se han adivinado
    const availableGuesses = words[currentCategory].filter(word => {
      return !machineGuesses.includes(word.toUpperCase());
    });
    if (availableGuesses.length === 0) {
      clearInterval(machineInterval);
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableGuesses.length);
    let guess = availableGuesses[randomIndex].toUpperCase();
    machineGuesses.push(guess);
    // Mostramos la respuesta en el contenedor de respuestas
    $(".answerscontainer").append("<p>IA: " + guess + "</p>");
    // Si la máquina acierta, detenemos el juego, el temporizador y el dibujo
    if (guess === currentWord) {
      clearInterval(timerInterval);
      $("#timer").text("IA won");
      gameActive = false;
      clearInterval(machineInterval);
      $mainCanvas.off("mousedown touchstart mouseup touchend mousemove touchmove");
    }
  }

  function startMachineGuess() {
    machineInterval = setInterval(machineGuess, 3000);
  }

  // Función para iniciar el temporizador
  function startTimer() {
    timerInterval = setInterval(function() {
      if (timeLeft > 0) {
        timeLeft--;
        $("#timer").text("Time: " + timeLeft);
      } else {
        clearInterval(timerInterval);
        $("#timer").text("Time's up!");
        gameActive = false;
        clearInterval(machineInterval);
        $mainCanvas.off("mousedown touchstart mouseup touchend mousemove touchmove");
      }
    }, 1000);
  }

  startTimer();
  startMachineGuess();

  // Evento para resetear el juego: reinicia canvas, contador, respuestas y asigna nueva palabra
  $("#resetgame").on("click", function() {
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    timeLeft = 30;
    $("#timer").text("Time: " + timeLeft);
    gameActive = true;
    $(".answerscontainer").empty();
    setRandomWord();
    clearInterval(timerInterval);
    clearInterval(machineInterval);
    bindCanvasEvents();
    startTimer();
    startMachineGuess();
  });
});
