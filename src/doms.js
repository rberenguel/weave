export { createPanel, zwsr, pad, wrap, prefix, postfix, divWithDraggableHandle };
import { hookBodies, hookBody } from "./internal.js";
import { manipulation } from "./panel.js";
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
const prefix = (node) => {
  node.insertAdjacentHTML("beforebegin", "&thinsp;");
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

const toTop = (b) => () => {
  Array.from(weave.containers()).forEach((b) => {
    b.classList.remove("on-top");
  });
  b.classList.add("on-top");
};

const createPanel = (parentId, id, buttons, weave) => {
  const bodyContainer = document.createElement("div");
  bodyContainer.classList.add("body-container");
  bodyContainer.parentId = parentId;

  interact(bodyContainer).resizable({
    edges: { left: true, right: true, bottom: true, top: true },
    // TODO There is something failing in resize
    listeners: {
      move(event) {
        let target = event.target;
        toTop(target)()
        let x = manipulation.get(target, manipulation.fields.kX)
        let y = manipulation.get(target, manipulation.fields.kY)
        manipulation.set(target, manipulation.fields.kWidth, event.rect.width)
        manipulation.set(target, manipulation.fields.kHeight, event.rect.height)
        manipulation.resize(target)
        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        console.log(x, y)
        manipulation.set(target, manipulation.fields.kX, x)
        manipulation.set(target, manipulation.fields.kY, y)
        manipulation.reposition(target)
      },
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 },
      }),
    ],
    inertia: false,
  });
  if (id != "b0") {
    const prevContainer = document
      .getElementById("b" + (weave.bodies().length - 1))
      .closest(".body-container");
    // TODO with datasets
    let x = manipulation.get(prevContainer, manipulation.fields.kX)
    let y = manipulation.get(prevContainer, manipulation.fields.kY)
    manipulation.set(bodyContainer, manipulation.fields.kX, x + 10)
    manipulation.set(bodyContainer, manipulation.fields.kY, y + 10)
    manipulation.reposition(bodyContainer)

  } else {
    
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

  interact(bodyContainer).dropzone({
    ondropmove: (ev) => {
      let placeholder = document.querySelector(
        ".div-dnd-placeholder"
      );
      const draggedElement = document.querySelector(".dragging");
      if(!draggedElement){
        return
      }
      if (!placeholder && draggedElement) {
        placeholder = document.createElement("div");
        placeholder.classList.add("div-dnd-placeholder");
        const bcr = draggedElement.getBoundingClientRect();
        if (bcr.height > bcr.width) {
          placeholder.style.height = bcr.height;
          placeholder.style.width = "1em";
        } else {
          placeholder.style.width = bcr.width;
          placeholder.style.height = "1em";
        }
      }
      // here
      const dropX = ev.dragEvent.client.x
      const dropY = ev.dragEvent.client.y
  
      let childMap = {}
      // The way I'm approaching this, sideways changes won't work.
      // I could do something though
      for(const child of ev.target.querySelector(".body").children) {
        if(child.classList.contains("div-dnd-placeholder")){
          continue
        }
        const childRect = child.getBoundingClientRect();
        const mid = childRect.top + childRect.height / 2;
        // In particular here. I could instead store an array if there are several in the same line
        childMap[mid] = child
      }
      
      if(placeholder && placeholder.parentNode){
        placeholder.parentNode.removeChild(placeholder);
      }
      const clearStyles = () => {
        if(placeholder){
          placeholder.classList.remove("dragging");
          placeholder.style.transform = "";
        }
      }        
      const appendOn = (ancestor) => {
        clearStyles()
        ancestor.appendChild(placeholder)
      }
      const sortedKeys = Array.from(Object.keys(childMap)).map(e => parseFloat(e)).sort((a, b) => a - b);
      console.log(sortedKeys)
      if(sortedKeys.length == 0){
        appendOn(ev.target.querySelector(".body"))
        return
      }
      if(sortedKeys[0] > dropY){
        const key = sortedKeys[0]
        clearStyles()
        childMap[key].parentNode.insertBefore(placeholder, childMap[key]);
        return
      }
      for(let i=0;i<sortedKeys.length;i++){
        const key = sortedKeys[i]
        if(key > dropY){
          clearStyles()
          console.log("dropping placeholder before:")
          console.log(childMap[key])
          childMap[key].parentNode.insertBefore(placeholder, childMap[key]);
          return
        }
      }
      const key = sortedKeys[sortedKeys.length-1]
      clearStyles()
      childMap[key].parentNode.appendChild(placeholder);
      return
    },
    // TODO all this d-n-d shenanigans needs tests
    ondrop: (ev) => {
      // TODO this code should be more equivalent to the placeholder drop, otherwise it behaves weirdly
      // Dropping for divs
      let placeholder = document.querySelector(
        ".div-dnd-placeholder"
      );
      if (placeholder) {
        placeholder.remove();
      }
      // TODO use the accept option of interact.js
      if (ev.relatedTarget.classList.contains("dynamic-div")) {
        console.info("Dropping a magical div")
        const dropX = ev.dragEvent.client.x
        const dropY = ev.dragEvent.client.y

        let childMap = {}
        for(const child of ev.target.querySelector(".body").children) {
          if(child.classList.contains("div-dnd-placeholder")){
            continue
          }
          const childRect = child.getBoundingClientRect();
          const mid = childRect.top + childRect.height / 2;
          // In particular here. I could instead store an array if there are several in the same line
          childMap[mid] = child
        }
        if(ev.relatedTarget.parentNode){
          ev.relatedTarget.parentNode.removeChild(ev.relatedTarget);
        }
        const clearStyles = () => {
          ev.relatedTarget.classList.remove("dragging");
          ev.relatedTarget.style.transform = "";
        }        
        const appendOn = (ancestor) => {
          clearStyles()
          ancestor.appendChild(ev.relatedTarget)
        }
        const sortedKeys = Array.from(Object.keys(childMap)).map(e => +e).sort();
        if(sortedKeys.length == 0){
          appendOn(ev.target.querySelector(".body"))
          return
        }
        if(sortedKeys[0] > dropY){
          const key = sortedKeys[0]
          clearStyles()
          childMap[key].parentNode.insertBefore(ev.relatedTarget, childMap[key]);
          return
        }
        for(let i=0;i<sortedKeys.length;i++){
          const key = sortedKeys[i]
          if(key > dropY){
            clearStyles()
            childMap[key].parentNode.insertBefore(ev.relatedTarget, childMap[key]);
            return
          }
        }
        const key = sortedKeys[sortedKeys.length-1]
        clearStyles()
        childMap[key].parentNode.appendChild(ev.relatedTarget);
        return
      } 
    },
  })

  interact(bodyContainer).draggable({
    allowFrom: betterHandle,
    ignoreFrom: body,
    inertia: true,
    autoscroll: true,
    listeners: {

      leave: (ev) => {
        console.log("elvis has left the building");
        console.log(ev);
      },
      move(event) {

        let x = manipulation.get(bodyContainer, manipulation.fields.kX)
        let y = manipulation.get(bodyContainer, manipulation.fields.kY)
        x += event.dx;
        y += event.dy;
        console.log(x, y)
        manipulation.set(bodyContainer, manipulation.fields.kX, x)
        manipulation.set(bodyContainer, manipulation.fields.kY, y)
        manipulation.reposition(bodyContainer)
      },
    },
  });
  // TODO: this might be better in weave directly
  betterHandle.addEventListener("click", toTop(bodyContainer));
  bodyContainer.addEventListener("click", toTop(bodyContainer));
  document.getElementById(parentId).appendChild(bodyContainer);
  hookBodies(buttons); // TODO fix this This wires all buttons 
  hookBody(body); //TODO fix this  This wires all the keys
  manipulation.forcePositionToReality(bodyContainer)
};

// Uh, this may screw moving divs, actually… Let's try to disable it
//document.getElementById("content").addEventListener('drop', drop("body-container"));
