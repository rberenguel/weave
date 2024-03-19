import { loadHash } from "./load.js";

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

weave.root = "content"

weave.createPanel(weave.root, "b0", weave.buttons(weave.root), weave);

// TODO Temporarily removing loading

// loadHash();

for (let body of weave.bodies()) {
  weave.hookBody(body);
}

// Prevent selection when dragging stuff (particularly divs)

document.isDragging = false

document.addEventListener('mousemove', (event) => {
  if (document.isDragging) {
    event.preventDefault();
  }
});

document.addEventListener('mouseup', () => {
  document.isDragging = false;
});

window.weave = weave;
