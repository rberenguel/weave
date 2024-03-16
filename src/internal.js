import weave from "./weave.js";
import { wireEverything } from "./load.js";
export { hookBodies, hookBody };
import { reset } from "./commands_base.js";
import { saveAll } from "./save.js";
import { zwsr } from "./doms.js";

const hookBodies = (buttons) => {
  for (let body of weave.bodies()) {
    if (!body.clickAttached) {
      body.addEventListener("click", (ev) => {
        weave.internal.clickedId.unshift(body.id);
        weave.internal.clickedId.length = 2;
        if (!weave.internal.cancelShifting) {
          weave.internal.bodyClicks.unshift(body.id);
          weave.internal.bodyClicks.length = 2;
          console.log(`Shifted previous: ${weave.internal.bodyClicks}`);
        } else {
          weave.internal.cancelShifting = false;
        }
        if (!ev.target.classList.contains("wired")) {
          const wired = document.getElementsByClassName("code wired");
          console.log(wired);
          // Try to undo edit mode
          for (let block of wired) {
            console.log(block);
            if (block.editing) {
              block.editing = false;
              block.innerText = block.oldText;
            }
          }
        }
      });
      body.clickAttached = true;
    }
    if (!body.dblClickAttached) {
      body.parentElement.addEventListener("dblclick", (ev) => {
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
          if (!weave.internal.preventFolding) {
            body.classList.toggle("folded");
            if (body.classList.contains("folded")) {
              body.dataset.height = body.parentElement.style.height;
              body.parentElement.style.height = "1.5em";
              body.style.height = "1.5em";
            } else {
              body.parentElement.style.height = body.dataset.height;
              body.style.height = "1.5em";
            }
          } else {
            weave.internal.preventFolding = false;
          }
        }
      });
      body.dblClickAttached = true;
    }

    // TODO(me) This will only work well for desktop. Figure out an option for mobile.
    body.addEventListener("contextmenu", wireButtons(buttons));
    interact(body).on("hold", wireButtons(buttons));
    body.addEventListener("paste", (event) => {
      // Paste takes a slight bit to modify the DOM, if I trigger
      // the wiring without waiting a pasted button might not be wired
      // properly.
      setTimeout(() => {
        wireEverything(weave.buttons(weave.root));
      }, 100);
    });
  }
};

const wireButtons = (buttons) => (event) => {
  const selectedText = window.getSelection();
  console.info(`Wiring button for ${selectedText}`);
  const range = selectedText.getRangeAt(0);
  if (
    event.srcElement.classList.length > 0 &&
    event.srcElement.classList.contains("alive")
  ) {
    return;
  }
  let node, result;
  console.log(buttons);
  for (let button of buttons) {
    if (button.text.includes(`${selectedText}`)) {
      result = button;
      node = button.el
        ? document.createElement(button.el)
        : document.createElement("span");
      break;
    }
  }

  if (node) {
    let div = document.createElement("div");
    node.innerHTML = `${selectedText}`.trim();
    div.contentEditable = false;
    div.addEventListener("mousedown", result.action);
    div.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
    div.addEventListener("dblclick", (ev) => {
      console.log("Preventing folding");
      weave.internal.preventFolding = true;
    });
    node.dataset.action = `${selectedText}`;
    div.classList.toggle("wrap");
    node.classList.toggle("alive");
    range.deleteContents();
    div.appendChild(node);
    range.insertNode(div);
    div.insertAdjacentHTML("beforebegin", "&thinsp;");
    div.insertAdjacentHTML("afterend", "&thinsp;");
    event.preventDefault();
  }
};

let keyStack = {};
let listing = {};
const hookBody = (body) => {
  keyStack[body.id] = ["Enter"]; // TODO Fishy on load though
  listing[body.id] = false; // TODO Horrible state machine
  body.addEventListener("keyup", (event) => {
    const ek = event.key; // TODO ref
    if (event.ctrlKey && event.key === "s") {
      saveAll();
    } else {
      if (event.key !== "Control") {
        reset();
      }
    }
    if (!["-", "Enter", " ", "#", "Shift", "`"].includes(ek)) {
      keyStack[body.id] = [];
    }

    const deleteCurrentWord = (selection) => {
      selection.extend(selection.anchorNode, 0);
      let range = selection.getRangeAt(0);
      range.deleteContents();
      return range;
    };
    //console.log(event.key);
    //console.log(keyStack);
    if (event.key === "-") {
      // State machine for lists and horizontal separators.
      // Keeps track of state in keyStack.
      if (keyStack[body.id][0] == "Enter") {
        keyStack[body.id].push("-");
        if (keyStack[body.id].slice(1).join("") === "---") {
          const zws = zwsr();
          keyStack[body.id] = ["Enter"]; // We want possibly lists in this case
          const selection = window.getSelection();
          let range = deleteCurrentWord(selection);
          const hr = document.createElement("hr");
          range.insertNode(zws);
          range.insertNode(hr);
          let newRange = document.createRange();
          newRange.setStartAfter(zws);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    if (event.key === "#") {
      // State machine for headings
      if (keyStack[body.id][0] == "Enter") {
        console.log("Pushed");
        keyStack[body.id].push("#");
      }
    }
    if (event.key === "`") {
      // State machine for code blocks
      if (keyStack[body.id][0] == "Enter") {
        keyStack[body.id].push("`");
      }
    }
    if (event.key === "Enter") {
      hilite();
      const selection = window.getSelection();
      if (listing[body.id] && keyStack[body.id].length == 0) {
        // Push the anchor where we pressed enter.
        // This is useful if we want to delete up to here.
        const range = selection.getRangeAt(0);
        listing[body.id].push(selection.anchorNode); // That should be the li
      }
      if (
        keyStack[body.id].length &&
        keyStack[body.id][0] == "Enter" &&
        listing[body.id]
      ) {
        // Deletion mode after an empty list item (i.e. we have written a few list items, press Enter
        // which starts a new list item which we do not want).
        const zws = zwsr();
        let range = document.createRange();
        range.setStartBefore(listing[body.id][listing[body.id].length - 1]); //selection.anchorNode)
        range.setEndAfter(selection.anchorNode);
        range.deleteContents();
        // Zero width space, TODO: remove on save
        range.insertNode(zws);
        selection.removeAllRanges();
        range.setStartAfter(zws); //listing[0]);
        selection.addRange(range);
        listing[body.id] = false; // Hah!
      }
      if (!listing[body.id] && selection.anchorNode.nodeName == "LI") {
        listing[body.id] = [selection.anchorNode];
      }
      keyStack[body.id] = [];
      keyStack[body.id].push("Enter");
    }
    if (event.key === " ") {
      if (
        keyStack[body.id][0] == "Enter" &&
        keyStack[body.id].slice(1)[0] == "#"
      ) {
        const hashes = keyStack[body.id]
          .slice(1)
          .filter((c) => c == "#").length;
        const headingLevel = Math.min(hashes, 6);
        const selection = window.getSelection();
        const zws = zwsr();
        let range = deleteCurrentWord(selection);
        let heading = document.createElement(`h${headingLevel}`);
        heading.appendChild(zws);
        range.insertNode(heading);
        range.collapse(false);
        let newRange = document.createRange();
        newRange.setStartAfter(heading);
        selection.removeAllRanges();
        selection.addRange(newRange);
        keyStack[body.id] = [];
      }
      if (
        keyStack[body.id].length == 4 &&
        keyStack[body.id].slice(1).join("") === "```"
      ) {
        console.log("Code block");
        // This is almost verbatim what I have for li and for h*
        const selection = window.getSelection();
        const zws = zwsr();
        let range = deleteCurrentWord(selection);
        let pre = document.createElement("pre");
        let div = document.createElement("div");
        div.appendChild(zwsr());
        pre.appendChild(zws);
        range.insertNode(div);
        //range.insertNode(pre);
        body.insertBefore(pre, div);
        range.collapse(false);
        let newRange = document.createRange();
        newRange.setStartBefore(pre);
        selection.removeAllRanges();
        selection.addRange(newRange);
        keyStack[body.id] = [];
      }
      if (keyStack[body.id][0] == "Enter" && keyStack[body.id][1] == "-") {
        // We have pressed "enter - space", meaning, we want a list.
        // Delete the current text (the - space part) and insert a
        // list item with a zero-width-space to place the cursor where
        // we want.
        const selection = window.getSelection();
        const zws = zwsr();
        let range = deleteCurrentWord(selection);
        li = document.createElement("li");
        li.appendChild(zws);
        range.insertNode(li);
        range.collapse(false);
        let newRange = document.createRange();
        newRange.setStartAfter(li);
        selection.removeAllRanges();
        selection.addRange(newRange);
        listing[body.id] = [li];
        keyStack[body.id] = [];
      }
    }
  });
};
