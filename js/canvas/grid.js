import { EVENTS } from '../events.js'

let canvas;
let ctx;
let style;

let mapProps = {
  size: 10000,
  grid: 500
};

let toCanvas = (pos) => 0;
let fromCanvas = (pos) => 0;

export default function init() {
  canvas = document.getElementById('grid');
  ctx = canvas.getContext("2d");
  style = window.getComputedStyle(canvas);

  let raito = 1;

  toCanvas = (pos) => pos * raito;
  fromCanvas = (pos) => pos / raito


  const drawGrid = (size, grid) => { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 10;
    ctx.strokeStyle = style.getPropertyValue('--border')

    ctx.font = "100px Consolas";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'hanging';
    ctx.fillStyle = style.getPropertyValue('--border');

    for (let index = 0; index < Math.floor(size / grid); index++) {
      let pos = toCanvas(index * grid)
      ctx.beginPath()

      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);

      ctx.stroke();
      ctx.fillText(`${index * grid}m`, pos + 50, 50);


      ctx.beginPath()

      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);

      ctx.stroke();
      ctx.fillText(`${index * grid}m`, 50, pos + 50);
    }
  }


  drawGrid(10000, 500);

  document.addEventListener(EVENTS.MAP_SET_CHANGED, (e) => {
    const { size, grid } = e.detail;

    raito = canvas.width / size;

    drawGrid(size, grid);
    mapProps = {...e.detail};
  })
}

export { canvas, ctx, style, mapProps, toCanvas, fromCanvas }