export { createPanel, zwsr, pad, wrap, postfix, divWithDraggableHandle };
import { hookBodies, hookBody } from "./internal.js";
import { addListeners } from "./dragging.js";

// I use this separator in many places
const zwsr = () => document.createTextNode("\u200b");

// HTML elements of interest
//const bodies = () => document.getElementsByClassName("body");
const info = document.querySelector("#info");

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

const createPanel = (id, buttons) => {
  const bodyContainer = document.createElement("div");
  bodyContainer.classList.add("body-container");
  const body = document.createElement("div");
  body.classList.add("body");
  body.classList.add("dark");
  body.classList.add("serif");
  body.contentEditable = true;
  body.id = id;
  const handle = document.createElement("div");
  handle.classList.add("panel-handle");
  handle.draggable = true;

  bodyContainer.appendChild(handle);
  bodyContainer.appendChild(body);
  addListeners(handle, bodyContainer, "body-container");
  document.getElementById("content").appendChild(bodyContainer);
  hookBodies(buttons); // This wires all buttons
  hookBody(body); // This wires all the keys
};

// Uh, this may screw moving divs, actually… Let's try to disable it
//document.getElementById("content").addEventListener('drop', drop("body-container"));
