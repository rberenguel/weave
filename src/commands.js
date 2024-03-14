export { buttons };

import weave from "./weave.js";
import { createPanel, postfix, divWithDraggableHandle } from "./doms.js";
import { common } from "./commands_base.js";
import { saveAll_, save } from "./save.js";
import { setupDragging } from "./betterDragging.js";

import { id, eval_, sql } from "./code.js";

import { addListeners } from "./dragging.js";

const div = {
  text: ["div"],
  action: (ev) => {
    const selection = window.getSelection();
    const container = document.createElement("div");
    container.appendChild(selection.getRangeAt(0).cloneContents());
    const selectedHTML = container.innerHTML + "";
    console.log(`Wiring div`);
    let range = selection.getRangeAt(0);
    const [div, handle] = divWithDraggableHandle();
    div.classList.add("dynamic-div");
    div.innerHTML = selectedHTML; // TODO(me) This nukes the handle
    setupDragging(div)
    //handle.classList.add("dynamic-handle");
    range.deleteContents();
    range.insertNode(div);
    postfix(div);
    //addListeners(handle, div, "dynamic-div");
  },
};

const mono = {
  text: ["mono"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const body = document.getElementById(weave.internal.bodyClicks[0]);
    body.classList.remove("serif");
    body.classList.add("mono");

    // TODO(me) This is still pending discussion with myself
    //config.mono = true;
  },
  description: "Switch to a monospace font (Monoid) (stored in config)",
  el: "u",
};

const gfont = {
  text: ["gfont"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const selection = window.getSelection() + "";
    const fontname = selection.replace(" ", "+");
    addGoogFont(fontname);
    const body = document.getElementById(weave.internal.bodyClicks[1]);
    body.style.fontFamily = selection;
    body.dataset.gfont = fontname;
  },
  description: "Fetch a font from Google Fonts and set it on a panel",
  el: "u",
};

const helpDiv = document.querySelector("#help");

helpDiv.addEventListener("mousedown", (ev) => {
  if (ev.button !== 0) {
    return;
  }
  helpDiv.style.display = "none";
  document.getElementById("content").classList.remove("blur");
});

const help = {
  text: ["help"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    helpDiv.style.display = "block";
    document.getElementById("content").classList.add("blur");
  },
  description: "Display help",
  el: "u",
};

const serif = {
  text: ["serif"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const body = document.getElementById(weave.internal.bodyClicks[0]);
    body.classList.add("serif");
    body.classList.remove("mono");
    // TODO(me) Does this really need to be stored in config at all? It's part of the saved styling after all
    // config.mono = true;
  },
  description: "Switch to a serif font (Reforma1969) (stored in config)",
  el: "u",
};

const newDoc = {
  text: ["new"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    body.innerHTML = "";
  },
  description: "Create a new document (erasing the current one)",
  el: "u",
};

const fontup = {
  text: ["font+", "f+"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const prevBody = document.getElementById(weave.internal.bodyClicks[0]);
    weave.internal.bodyClicks.unshift(weave.internal.bodyClicks[0]); // This is to allow resizing forever
    const fontSize = getComputedStyle(prevBody).fontSize;
    const newFontSize = parseFloat(fontSize) + 2;
    prevBody.style.fontSize = `${newFontSize}px`;
    ev.stopPropagation();
  },
  description: "Increase the document font by 2 pixels (stored in config)",
  el: "u",
};

const fontdown = {
  text: ["font-", "f-"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const prevBody = document.getElementById(weave.internal.bodyClicks[0]);
    weave.internal.bodyClicks.unshift(weave.internal.bodyClicks[0]); // This is to allow resizing forever
    console.log("Copied previous body");
    const fontSize = getComputedStyle(prevBody).fontSize;
    const newFontSize = parseFloat(fontSize) - 2;
    prevBody.style.fontSize = `${newFontSize}px`;
    weave.internal.cancelShifting = true;
  },
  description: "Decrease the document font by 2 pixels (stored in config)",
  el: "u",
};

function printDiv(divId) {
  const divElement = document.getElementById(divId);
  // TODO(me) Needs some minor styling, based on the chosen font (and font size?)
  const printWindow = window.open("", "", "height=400,width=600");
  printWindow.document.write("<html><head><title>Print</title>");
  printWindow.document.write();
  printWindow.document.write("</head><body>");
  printWindow.document.write(divElement.innerHTML);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

const close_ = {
  text: ["close", "❌"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    // TODO(me) I'm pretty sure closing-saving-loading would fail
    // if I delete an intermediate panel, needs a "test"
    const divToRemove = document.getElementById(weave.internal.bodyClicks[0]);
    const parentElement = divToRemove.parentNode;
    parentElement.removeChild(divToRemove);
  },
  description: "Eliminate a panel",
  el: "u",
};

const clear = {
  text: ["clear", "💨"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const divToClear = document.getElementById(weave.internal.bodyClicks[0]);
    divToClear.innerHTML = "";
  },
  description: "Fully eliminate content of a panel",
  el: "u",
};

const print_ = {
  text: ["print", "🖨️"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    printDiv(weave.internal.bodyClicks[0]);
  },
  description: "Trigger the print dialog",
  el: "u",
};

const title = {
  text: ["title"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const selection = window.getSelection() + "";
    const body = document.getElementById(weave.internal.bodyClicks[1]);
    body.dataset.filename = selection;
  },
  description: "Sets the title of this pane. Useful to store menus in the URL",
  el: "u",
};

const load = {
  text: ["load", "📂"],
  action: (ev) => {
    // Reverse of save. Needs a panel chosen

    filePicker.click();
  },
  description: "Load a pane to disk, you won't be choosing where though",
  el: "u",
};

const filePicker = document.getElementById("filePicker");

filePicker.addEventListener("change", (event) => {
  const file = event.target.files[0];

  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");

  reader.onload = (readerEvent) => {
    const content = readerEvent.target.result;
    console.log(content);
    console.log(decodeURIComponent(content));
    const base64Data = content.split(",")[1];
    console.log(base64Data);
    const decoded = decodeURIComponent(content);
    console.log(decoded);
    try {
      const b = JSON.parse(decoded);
      // TODO(me) This is now repeated when we load everything, too
      console.log(weave.internal.bodyClicks);
      const body = document.getElementById(weave.internal.bodyClicks[1]);
      body.dataset.filename = file.name;
      body.innerHTML = b["data"];
      body.style.width = b["width"];
      body.style.height = b["height"];
      if (b["folded"]) {
        body.classList.add("folded");
      }
      body.style.fontSize = b["fontSize"];
      body.style.fontFamily = b["fontFamily"];
      if (b["gfont"]) {
        addGoogFont(b["gfont"]);
      }
      wireEverything(weave.buttons(weave.root));
    } catch (error) {
      console.error("Error parsing JSON data:", error);
    }
  };
});

const split = (parentId) => {return {
  text: ["split"],
  action: (ev) => {
    console.info(`Splitting for parentId: ${parentId}`)
    if (common(ev)) {
      return;
    }
    const n = weave.bodies().length;
    const id = `b${n}`;
    // This is now repeated!
    createPanel(parentId, id, weave.buttons(weave.root));
  },
  description: "Add a new editing buffer",
  el: "u",
}}

const underline = {
  text: ["underline", "u"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    document.execCommand("underline", false, null);
  },
  description: "Underline the selected text",
  el: "u",
};

// TODO: document.execCommand is deprecated. I could do the same by playing with selections and ranges.
const italic = {
  text: ["italic", "i"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    document.execCommand("italic", false, null);
  },
  description: "Italicize the selected text",
  el: "i",
};

const bold = {
  text: ["bold", "b"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    document.execCommand("bold", false, null);
  },
  description: "Bold the selected text",
  el: "b",
};

const dark = {
  text: ["dark"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    for (let body of bodies()) {
      body.classList.toggle("dark");
    }

    config.dark = !config.dark;
  },
  description: "Toggle dark/light mode  (stored in config)",
  el: "u",
};

const buttons = (parentId) => {return  [
  mono,
  serif,
  fontup,
  fontdown,
  newDoc,
  print_,
  dark,
  saveAll_,
  bold,
  italic,
  underline,
  help,
  split(parentId), // TODO: all references to id content should point to this
  eval_,
  close_,
  clear,
  gfont,
  save,
  load,
  title,
  div,
  sql,
  id,
];}

weave.buttons = buttons;

let helpTable = [`<tr><td>Command</td><td>Help</td></tr>`];
for (let button of buttons()) {
  const commandText = button.text.join("/");
  const tr = `<tr><td>${commandText}</td><td>${button.description}</td></tr>`;
  helpTable.push(tr);
}
document.getElementById("commands").innerHTML = helpTable.join("\n");
