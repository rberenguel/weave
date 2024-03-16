export { createPanel, zwsr, pad, wrap, postfix, divWithDraggableHandle };
import { hookBodies, hookBody } from "./internal.js";
import { setupDragging } from "./betterDragging.js";

// TODO: I think I want to be able to move panels instead of drag-and-drop.

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

const createPanel = (parentId, id, buttons, weave) => {
  const bodyContainer = document.createElement("div");
  bodyContainer.classList.add("body-container");
  bodyContainer.parentId = parentId;
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

  //const handle = document.createElement("div");
  //handle.classList.add("panel-handle");
  //bodyContainer.appendChild(handle);
  //setupDragging(bodyContainer, handle);
  // TODO: this needs a test
  let pos = {
    x: 0, y: 0
  }
  if(id != "b0"){
  const prevContainer = document
    .getElementById("b" + (weave.bodies().length - 1))
    .closest(".body-container");
  
    pos.x = prevContainer.getBoundingClientRect().x + 10
    pos.y = prevContainer.getBoundingClientRect().y + 10
  
  // TODO Shift with respect to the previous one… this is hacky, should have a method
  

  bodyContainer.style.transform = "translate(" + pos.x + "px, " + pos.y + "px)";
  }
  const betterHandle = document.createElement("div");
  betterHandle.classList.add("better-handle");
  const body = document.createElement("div");
  body.classList.add("body");
  if (weave.config.dark) {
    body.classList.add("dark");
    bodyContainer.classList.add("dark");
  } else {
    body.classList.add("light");
    bodyContainer.classList.add("light");
  }
  body.classList.add("serif");
  body.classList.add("on-top");
  body.contentEditable = true;
  body.id = id;
  betterHandle.appendChild(body);
  bodyContainer.appendChild(betterHandle);
  interact(bodyContainer).draggable({
    allowFrom: betterHandle,
    ignoreFrom: body,
    listeners: {
      move(event) {
        pos.x += event.dx;
        pos.y += event.dy;
        event.target.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      },
    },
  });
  // TODO: this might be better in weave directly
  const toTop = (e) => {
    Array.from(weave.containers()).forEach((b) => {
      b.classList.remove("on-top");
    });
    bodyContainer.classList.add("on-top");
  };
  betterHandle.addEventListener("click", toTop);
  bodyContainer.addEventListener("click", toTop);
  document.getElementById(parentId).appendChild(bodyContainer);
  hookBodies(buttons); // This wires all buttons
  hookBody(body); // This wires all the keys
};

// Uh, this may screw moving divs, actually… Let's try to disable it
//document.getElementById("content").addEventListener('drop', drop("body-container"));
