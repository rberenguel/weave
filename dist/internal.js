import weave from './weave.js'
import { wireEverything } from "./load.js"
export { hookBodies }

const hookBodies = (buttons) => {
    for (let body of weave.bodies()) {
      if (!body.clickAttached) {
        body.addEventListener("click", (ev) => {
          if (!weave._cancelShifting) {
            weave.bodyClicks.unshift(body.id);
            weave.bodyClicks.length = 2;
            console.log(`Shifted previous: ${weave.bodyClicks}`);
          } else {
            weave._cancelShifting = false;
          }
        });
        body.clickAttached = true;
      }
      if (!body.dblClickAttached) {
        body.addEventListener("dblclick", (ev) => {
          const selection = window
            .getSelection()
            .toString()
            .replace(/\s+/g, "").length;
          if (selection.length > 0) {
            console.log(
              `You have selected something ('${selection}'), not folding`
            );
            return;
          } else {
            if (!preventFolding) {
              body.classList.toggle("folded");
              if (body.classList.contains("folded")) {
                body.dataset.height = body.style.height;
                body.style.height = "";
              } else {
                body.style.height = body.dataset.height;
              }
            } else {
              preventFolding = false;
            }
          }
        });
        body.dblClickAttached = true;
      }
  
      // TODO(me) This will only work well for desktop. Figure out an option for mobile.
      body.addEventListener("contextmenu", (event) => {
        const selectedText = window.getSelection();
        const range = selectedText.getRangeAt(0);
        if (
          event.srcElement.classList.length > 0 &&
          event.srcElement.classList.contains("alive")
        ) {
          return;
        }
        let node;
  
        for (let button of buttons) {
          // This can be sped up by reversing the indexing
          if (button.text.includes(`${selectedText}`)) {
            node = document.createElement(button.el);
            node.onmousedown = button.action;
            node.addEventListener("dblclick", (ev) => {
              console.log("Preventing folding")
              preventFolding = true;
            });
            node.dataset.action = `${selectedText}`;
          }
        }
  
        if (node) {
          let div = document.createElement("div");
          node.innerHTML = `${selectedText}`.trim();
          div.classList.toggle("wrap");
          node.classList.toggle("alive");
          range.deleteContents();
          div.appendChild(node);
          range.insertNode(div);
          div.insertAdjacentHTML("beforebegin", "&thinsp;");
          div.insertAdjacentHTML("afterend", "&thinsp;");
          event.preventDefault();
        }
      });
      body.addEventListener("paste", (event) => {
        // Paste takes a slight bit to modify the DOM, if I trigger
        // the wiring without waiting a pasted button might not be wired
        // properly.
        setTimeout(() => {
          wireEverything(weave.buttons());
        }, 100);
      });
    }
  };
  