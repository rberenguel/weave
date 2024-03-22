import { loadAllFromGroup } from "./commands.js";

// Can't import from dom due to circular dependency?
import weave from "./weave.js";

// Globals that are used everywhere

// Helper for inline code

let $ = {
  cel: (s) => document.createElement(s),
  ctn: (s) => document.createTextNode(s),
  byId: (s) => document.getElementById(s),
  qs: (s) => document.querySelector(s),
};

weave.root = "content";

document.isDragging = false;

document.addEventListener("mousemove", (event) => {
  if (document.isDragging) {
    event.preventDefault();
  }
});

document.addEventListener("mouseup", () => {
  document.isDragging = false;
});

window.weave = weave;
window.w = window.weave;

const urlParams = new URLSearchParams(window.location.search);
const gloadParam = urlParams.get("gload");

interact(document.body).draggable({
  inertia: true,
  ignoreFrom: ".body-container",
  listeners: {
    move(event) {
      const body = document.body;
      let x = parseFloat(body.dataset.x || 0);
      let y = parseFloat(body.dataset.y || 0);
      let scale = parseFloat(document.body.dataset.scale || 1);
      x += event.dx;
      y += event.dy;
      body.dataset.x = Math.floor(x);
      body.dataset.y = Math.floor(y);
      body.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    },
  },
});

document.body.addEventListener('wheel', (event) => {
  const body = document.body;
  let x = parseFloat(body.dataset.x || 0);
  let y = parseFloat(body.dataset.y || 0);
  const zoomDelta = 0.01
  const sign = Math.sign(event.deltaY)
  const transformed = Math.log(Math.abs(event.deltaY))*zoomDelta
  let scale = parseFloat(body.dataset.scale || 1);
  if(sign < 1){
    scale = scale + transformed;
    body.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  } else {
    scale = scale - transformed;
    body.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }
  body.dataset.scale = scale
});

if (gloadParam) {
  loadAllFromGroup(gloadParam);
} else {
  try {
    loadAllFromGroup("weave:last-session");
  } catch (err) {
    console.log("Could not load from previous session", err);

    weave.createPanel(weave.root, "b0", weave.buttons(weave.root), weave);

    for (let body of weave.bodies()) {
      weave.hookBody(body);
    }
  }
}
