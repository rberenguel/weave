export { addListeners };

let draggedElement;
let currentParentClass;

const addListeners = (handle, parent, parentClass) => {
  handle.addEventListener("dragstart", startDrag(parentClass));
  parent.addEventListener("dragover", dragOver);
  parent.addEventListener("drop", drop);
};

const startDrag = (parentClass) => (event) => {
  currentParentClass = parentClass;
  draggedElement = event.target.parentNode;
  console.log(`Dragging vs ${currentParentClass}`);
  draggedElement.classList.add(`dragging`);
};

// This still has too many edge cases. For example, dropping on top of the placeholder, for divs, is broken.

const drop = (event) => {
  event.preventDefault();
  console.log("Droppin");

  const placeholder = document.querySelector(".body-container-dnd-placeholder");
  if (placeholder) placeholder.remove();
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }
  console.log(event.target);
  let target = event.target.closest(`.${currentParentClass}`);
  if (event.target.querySelector(".body")) {
    target = event.target.querySelector(".body");
  } else {
    if (!target) {
      target = event.target.closest(".body");
    }
  }

  console.log(target);
  if (draggedElement && target && target !== draggedElement) {
    const targetRect = target.getBoundingClientRect();

    if (event.clientY > targetRect.top + targetRect.height / 2) {
      target.parentNode.insertBefore(draggedElement, target.nextSibling);
    } else {
      target.parentNode.insertBefore(draggedElement, target);
    }
  }
};
