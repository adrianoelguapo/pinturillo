// game.js - Código corregido y completo

const mainCanvas = document.getElementById("main-canvas");
const context = mainCanvas.getContext("2d");

let initialX;
let initialY;

const getPosicionCanvas = (evt) => {
  const rect = mainCanvas.getBoundingClientRect();
  let x, y;
  
  if (evt.changedTouches) {
    // Para dispositivos táctiles
    x = evt.changedTouches[0].clientX - rect.left;
    y = evt.changedTouches[0].clientY - rect.top;
  } else {
    // Para eventos de ratón
    x = evt.clientX - rect.left;
    y = evt.clientY - rect.top;
  }
  
  // Ajustar las coordenadas en caso de que el canvas esté escalado vía CSS
  x *= mainCanvas.width / rect.width;
  y *= mainCanvas.height / rect.height;
  
  return { x, y };
};

const dibujar = (cursorX, cursorY) => {
  context.beginPath();
  context.moveTo(initialX, initialY);
  context.lineWidth = 5;
  context.strokeStyle = "#000";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineTo(cursorX, cursorY);
  context.stroke();
  
  // Actualizamos la posición inicial para el siguiente trazo
  initialX = cursorX;
  initialY = cursorY;
};

const mouseDown = (evt) => {
  evt.preventDefault();
  const pos = getPosicionCanvas(evt);
  initialX = pos.x;
  initialY = pos.y;
  dibujar(initialX, initialY);
  mainCanvas.addEventListener("mousemove", mouseMoving);
  mainCanvas.addEventListener("touchmove", mouseMoving);
};

const mouseMoving = (evt) => {
  evt.preventDefault();
  const pos = getPosicionCanvas(evt);
  dibujar(pos.x, pos.y);
};

const mouseUp = (evt) => {
  evt.preventDefault();
  mainCanvas.removeEventListener("mousemove", mouseMoving);
  mainCanvas.removeEventListener("touchmove", mouseMoving);
};

mainCanvas.addEventListener("mousedown", mouseDown);
mainCanvas.addEventListener("mouseup", mouseUp);
mainCanvas.addEventListener("touchstart", mouseDown);
mainCanvas.addEventListener("touchend", mouseUp);
