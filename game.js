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

  let round = 1;
  const maxRounds = 5;
  let playerPoints = 0;
  let iaPoints = 0;

  let currentCategory;
  let currentWord;

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

  let playerHasDrawn = false;
  let drawTimeout;

  function updateScoreboard(){
    $("#playerpoints").html("<b>Player:</b> " + playerPoints);
    $("#iapoints").html("<b>IA:</b> " + iaPoints);
    $(".rounds").text("Round: " + round + "/" + maxRounds);
  }
  updateScoreboard();

  function startDrawTimeout(){
    playerHasDrawn = false;
    drawTimeout = setTimeout(function(){
      if (!playerHasDrawn && gameActive){
        endRound("ia");
      }
    }, 10000);
  }

  const getPosicionCanvas = function(evt){
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

  const dibujar = function(cursorX, cursorY){
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

  const mouseDown = function(evt){
    if (!gameActive) return;
    evt.preventDefault();
    if (!playerHasDrawn) {
      playerHasDrawn = true;
      clearTimeout(drawTimeout);
    }
    const pos = getPosicionCanvas(evt);
    initialX = pos.x;
    initialY = pos.y;
    dibujar(initialX, initialY);
    $mainCanvas.on("mousemove touchmove", mouseMoving);
  };

  const mouseMoving = function(evt){
    if (!gameActive) return;
    evt.preventDefault();
    const pos = getPosicionCanvas(evt);
    dibujar(pos.x, pos.y);
  };

  const mouseUp = function(evt){
    evt.preventDefault();
    $mainCanvas.off("mousemove touchmove", mouseMoving);
  };

  function bindCanvasEvents(){
    $mainCanvas.on("mousedown touchstart", mouseDown);
    $mainCanvas.on("mouseup touchend", mouseUp);
  }
  bindCanvasEvents();

  $("#cleanboard").on("click", function(){
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  });

  $("#thinline").on("click", function(){
    currentLineWidth = 2;
  });
  $("#mediumline").on("click", function(){
    currentLineWidth = 4;
  });
  $("#thickline").on("click", function(){
    currentLineWidth = 6;
  });

  $(".color").on("click", function(){
    const bgColor = $(this).css("background-color");
    currentStrokeStyle = bgColor;
  });

  function setRandomWord(){
    const categories = Object.keys(words);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomIndex = Math.floor(Math.random() * words[randomCategory].length);
    const randomWord = words[randomCategory][randomIndex];
    currentCategory = randomCategory;
    currentWord = randomWord.toUpperCase();
    $("#word").text(currentWord);
    machineGuesses = [];
  }
  
  setRandomWord();

  function machineGuess(){
    if (!gameActive) {
      clearInterval(machineInterval);
      return;
    }

    const availableGuesses = words[currentCategory].filter(word =>{
      return !machineGuesses.includes(word.toUpperCase());
    });

    if (availableGuesses.length === 0){
      clearInterval(machineInterval);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableGuesses.length);
    let guess = availableGuesses[randomIndex].toUpperCase();
    machineGuesses.push(guess);

    $(".answerscontainer").append("<p>IA: " + guess + "</p>");
    if (guess === currentWord){
      endRound("ia");
    }
  }

  function startMachineGuess(){
    machineInterval = setInterval(machineGuess, 3000);
  }

  function startTimer() {
    timerInterval = setInterval(function(){
      if (timeLeft > 0) {
        timeLeft--;
        $("#timer").text("Time: " + timeLeft);
      } else {
        clearInterval(timerInterval);
        if (gameActive) {
          endRound("player");
        }
      }
    }, 1000);
  }

  function endRound(winner){
    clearInterval(timerInterval);
    clearInterval(machineInterval);
    clearTimeout(drawTimeout);

    if (winner === "ia"){
      $("#timer").text("IA won");
      iaPoints += 5;
    } else if (winner === "player"){
      $("#timer").text("Player won");
      playerPoints += 5;
    }

    updateScoreboard();

    $(".answerscontainer").empty();

    gameActive = false;

    $mainCanvas.off("mousedown touchstart mouseup touchend mousemove touchmove");

    if (round < maxRounds){
      round++;
      setTimeout(function(){
        context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        timeLeft = 30;
        $("#timer").text("Time: " + timeLeft);
        gameActive = true;
        setRandomWord();
        bindCanvasEvents();
        updateScoreboard();
        startTimer();
        startMachineGuess();
        startDrawTimeout();
      }, 2000);
    } else {
      $("#timer").text("Game Over!");
    }
  }

  startTimer();
  startMachineGuess();
  startDrawTimeout();

  $("#resetgame").on("click", function(){
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    timeLeft = 30;
    round = 1;
    playerPoints = 0;
    iaPoints = 0;
    updateScoreboard();
    $("#timer").text("Time: " + timeLeft);
    gameActive = true;
    $(".answerscontainer").empty();
    setRandomWord();
    clearInterval(timerInterval);
    clearInterval(machineInterval);
    clearTimeout(drawTimeout);
    bindCanvasEvents();
    startTimer();
    startMachineGuess();
    startDrawTimeout();
  });

});