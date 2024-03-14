export { createPanel, zwsr, pad, wrap, postfix, divWithDraggableHandle };
import { hookBodies, hookBody } from "./internal.js";
import { setupDragging } from "./betterDragging.js";

// I use this separator in many places
const zwsr = () => document.createTextNode("\u200b");

// HTML elements of interest
//const bodies = () => document.getElementsByClassName("body");

const pad = (node) => {
  node.insertAdjacentHTML("afterbegin", "&thinsp;");
  node.insertAdjacentHTML("beforeend", "&thinsp;");
};

const wrap = (node) => {
  postfix(node);
};

const postfix = (node) => {
  node.insertAdjacentHTML("afterend", "&thinsp;");
};

const divWithDraggableHandle = () => {
  const div = document.createElement("div");
  const handle = document.createElement("div");
  handle.classList.add("handle");
  handle.draggable = true;
  div.appendChild(handle);
  return [div, handle];
};

const createPanel = (parentId, id, buttons) => {
  const bodyContainer = document.createElement("div");
  bodyContainer.classList.add("body-container");
  bodyContainer.parentId = parentId
  interact(bodyContainer).resizable({
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;

        target.style.width = event.rect.width + "px";
        target.style.height = event.rect.height + "px";

      },
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 },
      }),
    ],
    inertia: false,
  });

  const handle = document.createElement("div");
  handle.classList.add("panel-handle");
  bodyContainer.appendChild(handle);
  setupDragging(bodyContainer, handle)

  const body = document.createElement("div");
  body.classList.add("body");
  body.classList.add("dark");
  bodyContainer.classList.add("dark"); // TODO
  body.classList.add("serif");
  body.contentEditable = true;
  body.id = id;
  bodyContainer.appendChild(body);
  document.getElementById(parentId).appendChild(bodyContainer);
  hookBodies(buttons); // This wires all buttons
  hookBody(body); // This wires all the keys
};

// Uh, this may screw moving divs, actually… Let's try to disable it
//document.getElementById("content").addEventListener('drop', drop("body-container"));
