$(document).ready(function() {
  const $mainCanvas = $("#main-canvas");
  const mainCanvas = $mainCanvas[0];
  const context = mainCanvas.getContext("2d");

  let initialX;
  let initialY;
  let currentLineWidth = 2;
  let currentStrokeStyle = "#000";

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

  const mouseDown = function(evt) {
    evt.preventDefault();
    const pos = getPosicionCanvas(evt);
    initialX = pos.x;
    initialY = pos.y;
    dibujar(initialX, initialY);
    $mainCanvas.on("mousemove touchmove", mouseMoving);
  };

  const mouseMoving = function(evt) {
    evt.preventDefault();
    const pos = getPosicionCanvas(evt);
    dibujar(pos.x, pos.y);
  };

  const mouseUp = function(evt) {
    evt.preventDefault();
    $mainCanvas.off("mousemove touchmove", mouseMoving);
  };

  $mainCanvas.on("mousedown touchstart", mouseDown);
  $mainCanvas.on("mouseup touchend", mouseUp);

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

});