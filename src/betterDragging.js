export { setupDragging, draggy };

let draggedElement;

function dragMoveListener(event) {
  event.preventDefault();
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the position attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}

const endDrag = (event) => {
  const placeholder = document.querySelector(".body-container-dnd-placeholder");
  if (placeholder) placeholder.remove();
  //event.target.style.transform = ""
  event.target.setAttribute("data-x", null);
  event.target.setAttribute("data-y", null);
};

const dragOver = (event) => {
  event.preventDefault();
  let placeholder = document.querySelector(".body-container-dnd-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.classList.add("body-container-dnd-placeholder");
    const bcr = draggedElement.getBoundingClientRect();
    if (bcr.height > bcr.width) {
      placeholder.style.height = bcr.height;
      placeholder.style.width = "1em";
    } else {
      placeholder.style.width = bcr.width;
      placeholder.style.height = "1em";
    }
  }
  let target = event.target;
  console.log(target);
  const targetRect = target.getBoundingClientRect();
  console.log(event);
  if (event.dragEvent.clientY > targetRect.top + targetRect.height / 8) {
    target.parentNode.insertBefore(placeholder, target.nextSibling);
    console.log(`After ${event.dragEvent.clientY} ${targetRect.top}`);
  } else {
    console.log(`Before ${event.dragEvent.clientY} ${targetRect.top}`);
    target.parentNode.insertBefore(placeholder, target);
  }
};

const ondrop = (event) => {
  const placeholder = document.querySelector(".body-container-dnd-placeholder");
  if (placeholder) placeholder.remove();
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }
  let target = event.target;

  if (draggedElement && target && target !== draggedElement) {
    const targetRect = target.getBoundingClientRect();

    if (event.dragEvent.clientY > targetRect.top + targetRect.height / 8) {
      target.parentNode.insertBefore(draggedElement, target.nextSibling);
    } else {
      target.parentNode.insertBefore(draggedElement, target);
    }
  }
};

const draggy = (div) => {
  interact(div).draggable({
    //allowFrom: handle,
    inertia: false,
    //startAxis: "xy",
    //lockAxis: "start",
    modifiers: [
      /*interact.modifiers.restrictRect({
        endOnly: true,
      }),*/
    ],
    autoScroll: false,
    cursorChecker(action, interactable, element, interacting) {
      if (action.name === "drag") {
        return "auto";
      }
    },
    listeners: {
      start: (event) => {
        event.preventDefault();
        draggedElement = event.target;
        const rect = draggedElement.getBoundingClientRect()
        
        draggedElement.dataset.x = rect.x;
        draggedElement.dataset.y = rect.y;
        console.log("Doing stuff with");
        console.log(draggedElement);
        draggedElement.parentNode.removeChild(draggedElement);
        draggedElement.classList.add("dragging")
        document.getElementById(weave.root).appendChild(draggedElement);
      },
      enter: (ev) => {
        event.preventDefault();
        console.log("ev entered")
        console.log(ev.target);
      },
      move: dragMoveListener,
      end: (ev) => {
        console.log("ev end")
        console.log(ev.target);
      }
    },
  });
};

const setupDragging = (element, handle) => {
  interact(element).dropzone({
    ondrop: ondrop,
  });
  interact(element).draggable({
    allowFrom: handle,
    inertia: true,
    //startAxis: "xy",
    //lockAxis: "start",
    modifiers: [
      /*interact.modifiers.restrictRect({
            endOnly: true,
          }),*/
    ],
    autoScroll: true,
    cursorChecker(action, interactable, element, interacting) {
      if (action.name === "drag") {
        return "auto";
      }
    },
    onstart: (event) => {},
    listeners: {
      enter: (event) => {
        dragOver(event);
      },
      move: dragMoveListener,
      end: endDrag,
    },
  });
};
