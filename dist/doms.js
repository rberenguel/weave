export { createPanel }
import { hookBodies } from "./internal.js"

const createPanel = (id, buttons) => {
    const bodyContainer = document.createElement("div");
    bodyContainer.classList.add("body-container")
    const body = document.createElement("div");
    body.classList.add("body");
    body.classList.add("dark");
    body.classList.add("serif");
    body.contentEditable = true;
    body.id = id;
    const handle = document.createElement("div")
    handle.classList.add("handle")
    handle.draggable = true
    handle.addEventListener("dragstart", startDrag);
    bodyContainer.addEventListener('dragover', dragOver);
    bodyContainer.addEventListener('drop', drop);
    bodyContainer.appendChild(handle)
    bodyContainer.appendChild(body)
    document.getElementById("content").appendChild(bodyContainer);
    hookBodies(buttons);
  }


let draggedElement

function startDrag(event) {
  draggedElement = event.target.parentNode; // The body-container
  draggedElement.classList.add('dragging');
}


function dragLeave(event){
  const placeholder = document.querySelector('.body-container-dnd-placeholder');
  if (placeholder) placeholder.remove(); 
}

function dragOver(event) {
  event.preventDefault();
  let placeholder = document.querySelector('.body-container-dnd-placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.classList.add('body-container-dnd-placeholder');
    const bcr = draggedElement.getBoundingClientRect();
    if(bcr.height > bcr.width){
      placeholder.style.height = draggedElement.style.height
      placeholder.style.width = "1em"
    } else {
      placeholder.style.width = draggedElement.style.width
      placeholder.style.height = "1em"
    }
    placeholder.addEventListener('drop', drop);
    placeholder.addEventListener('dragover', (event) => event.preventDefault())
  }

  const target = event.target.closest('.body-container');
  const targetRect = target.getBoundingClientRect(); 
  if (event.clientY > (targetRect.top + targetRect.height / 2)) {
    target.parentNode.insertBefore(placeholder, target.nextSibling); 
  } else {
    target.parentNode.insertBefore(placeholder, target); 
  }
}

function drop(event) {
  event.preventDefault();
  console.log("Droppin")
  const placeholder = document.querySelector('.body-container-dnd-placeholder');
  if (placeholder) placeholder.remove();
  if(draggedElement){
    draggedElement.classList.remove('dragging');
  }

  const target = event.target.closest('.body-container');

  if (draggedElement && target && target !== draggedElement) {
    //const draggedRect = draggedElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect(); 

    if (event.clientY > (targetRect.top + targetRect.height / 2)) {
      // Insert draggedElement after the target
      target.parentNode.insertBefore(draggedElement, target.nextSibling); 
    } else {
      // Insert draggedElement before the target
      target.parentNode.insertBefore(draggedElement, target); 
    }
  }
}

document.getElementById("content").addEventListener('drop', drop);
