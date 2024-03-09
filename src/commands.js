function reset() {
  info.classList.remove("fades");
  info.innerText = "";
}

function common(ev) {
  reset();
  return ev.button !== 0;
}

const mono = {
  text: ["mono"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const body = document.getElementById(bodyClicks[0]);
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
    const body = document.getElementById(bodyClicks[1]);
    body.style.fontFamily = selection;
    body.dataset.gfont = fontname;
  },
  description: "Fetch a font from Google Fonts and set it on a panel",
  el: "u",
};

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
    const body = document.getElementById(bodyClicks[0]);
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
    const prevBody = document.getElementById(bodyClicks[0]);
    const fontSize = getComputedStyle(prevBody).fontSize;
    const newFontSize = parseFloat(fontSize) + 2;
    prevBody.style.fontSize = `${newFontSize}px`;
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
    const prevBody = document.getElementById(bodyClicks[0]);
    const fontSize = getComputedStyle(prevBody).fontSize;
    const newFontSize = parseFloat(fontSize) - 2;
    prevBody.style.fontSize = `${newFontSize}px`;
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
    const divToRemove = document.getElementById(bodyClicks[0]);
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
    const divToClear = document.getElementById(bodyClicks[0]);
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
    printDiv(bodyClicks[0]);
  },
  description: "Trigger the print dialog",
  el: "u",
};

const save = {
  text: ["save", "💾"],
  action: (ev) => {
    // If there is no text selected, use the filename from the panel.
    // If there is no text selected, and the panel has no filename, use om.json

    const selection = window.getSelection() + "";
    let body;
    let filename = "om.json";
    let selected = false;
    if (selection.length > 0) {
      filename = selection;
      body = document.getElementById(bodyClicks[1]);
    } else {
      body = document.getElementById(bodyClicks[0]);
      if (body.dataset.filename) {
        filename = body.dataset.filename;
      }
    }
    body.dataset.filename = filename;
    let b = {};
    b["data"] = body.innerHTML;
    b["width"] = body.style.width;
    b["height"] = body.style.height;
    b["folded"] = body.classList.contains("folded");
    b["fontSize"] = body.style.fontSize;
    b["fontFamily"] = body.style.fontFamily;
    b["gfont"] = body.dataset.gfont;
    b["filename"] = body.dataset.filename;
    const savedata = JSON.stringify(b);
    console.log("Saving file");
    const fileData =
      "data:application/json;base64," + btoa(encodeURIComponent(savedata));

    const downloadLink = document.createElement("a");
    downloadLink.href = fileData;
    downloadLink.download = filename;
    downloadLink.click();
  },
  description: "Save a pane to disk, you won't be choosing where though",
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
      console.log(bodyClicks);
      const body = document.getElementById(bodyClicks[1]);
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
      wireEverything();
    } catch (error) {
      console.error("Error parsing JSON data:", error);
    }
  };
});

const saveAll_ = {
  text: ["saveAll"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    saveAll();
    //ev.stopPropagation();
  },
  description:
    "Save the current changes and config in the URL, so it survives browser crashes",
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

const split = {
  text: ["split"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    // This is now repeated!
    n = bodies.length;
    const div = document.createElement("div");
    div.classList.add("body");
    div.classList.add("dark");
    div.classList.add("serif");
    div.contentEditable = true;
    div.id = `b${n}`;
    document.getElementById("content").appendChild(div);
    hookBody(div);
    bodies = document.getElementsByClassName("body");
    hookBodies();
  },
  description: "Add a new editing buffer",
  el: "u",
};

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

const evalExpr = (selectionText) => {
  console.log("Evaluating " + selectionText);
  try {
    const evaluation = eval?.(selectionText);
    const lines = selectionText.split("\n");
    const multiline = lines.length > 1;
    let assignment, rvalue;
    if (!multiline) {
      const matchesAssignment = selectionText.match(/(\w*)\s*=\s*(.*)/);
      if (matchesAssignment) {
        const variable = matchesAssignment[1];
        console.log("Has an equal, variable is named ", variable);
        assignment = document.createElement("span");
        assignment.classList.add("assignment");
        rvalue = document.createTextNode(matchesAssignment[2]);
        const assignmentText = document.createTextNode(`${variable}`);
        assignment.appendChild(assignmentText);
      }
      const text = document.createTextNode(evaluation);
      return [assignment, rvalue, [text], null];
    }
    const texts = lines.map((line) => document.createTextNode(line));
    return [assignment, rvalue, texts, null];
  } catch (error) {
    console.log("Errored: ", error);
    return [null, null, null, error];
  }
};

const pad = (node) => {
  node.insertAdjacentHTML("afterbegin", "&thinsp;");
  node.insertAdjacentHTML("beforeend", "&thinsp;");
};

const wrap = (node) => {
  // Seems to no longer be needed, when using divs?
  //node.insertAdjacentHTML("beforebegin", "&thinsp;");
  postfix(node);
};

const postfix = (node) => {
  node.insertAdjacentHTML("afterend", "&thinsp;");
};

const wireEvalFromScratch = () => {
  const selection = window.getSelection();
  const selectionText = selection + "";
  console.log(`Wiring eval, first time: ${selectionText}`)
  let [assignment, rvalue, evaluation, error] = evalExpr(selectionText);
  const code = document.createElement("div");
  code.classList.add("wired", "code");
  let range = selection.getRangeAt(0);
  // We need to skip the assignment span to get to the code block…
  // Or stay one below for no-assignments :shrug:
  const parentNodeAssignment = range.startContainer.parentNode.parentNode;
  const parentNodePlain = range.startContainer.parentNode;
  const tagAssignment = parentNodeAssignment.tagName;
  const tagPlain = parentNodePlain.tagName;
  const skipAssignment =
    tagAssignment == "DIV" &&
    parentNodeAssignment.classList.contains("wired") &&
    parentNodeAssignment.classList.contains("code");
  const skipPlain =
    tagPlain == "DIV" &&
    parentNodePlain.classList.contains("wired") &&
    parentNodePlain.classList.contains("code");
  if (skipPlain || skipAssignment) {
    // If the block is wired we skip
    console.log("Skipping already wired");
    // I'm returning undefined for now, but I likely will need the node
    // further down.
    if (skipPlain) {
      return undefined;
    } else {
      return undefined;
    }
  } else {
    range.deleteContents();
    range.insertNode(code);
    code.dataset.eval_string = selectionText;
    console.log("Setting evaluation to ", code.dataset.eval_string);
    code.hover_title = code.dataset.eval_string;
    code.id = "c" + Date.now();
    if (error) {
      code.appendChild(document.createTextNode(selectionText));
      code.classList.add("error");
      code.hover_title = error; // Beware padding with error in multiline
      pad(code);
      wireHandle(code);
      return code;
    }
    if (assignment) {
      code.appendChild(assignment);
      code.appendChild(rvalue);
      assignment.insertAdjacentHTML("afterend", " = ");
      postfix(code);
    } else {
      if (evaluation.length == 1) {
        // This no-op is needed to prevent floating weirdness (beforebegin)
        // and to allow the cursor to go to the end (afterend)
        wrap(code);
      } else {
        postfix(code);
      }
      for (let i = 0; i < evaluation.length; i++) {
        const line = evaluation[i];
        code.appendChild(line);
        if (i != evaluation.length - 1) {
          const lineBreak = document.createElement("br");
          code.appendChild(lineBreak);
        }
      }
    }
  }
  //pad(code);
  wireHandle(code);
  return code;
};

const codeInfo = document.querySelector(".code-info");
let codeInfoTimeout;

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" || mutation.type === "characterData") {
      const parent = mutation.target.parentElement;
      console.log(mutation.target.parentElement);
      if (parent.classList.contains("wired")) {
        parent.classList.add("dirty");
        parent.classList.remove("error");
        parent.hover_title = "edited";
      }
    }
  });
});

const wireHandle = (code) => {
  const handle = document.createElement("div");
  handle.id = code.id.replace("c", "h");
  handle.classList.add("draggable-handle");
  handle.draggable = true;
  code.appendChild(handle);
  console.log("Should be there…");
  handle.addEventListener("dragstart", (event) => {
    console.log("draggin");
    srcCodeBlockId = event.target.id;
    //event.preventDefault();
  });
  handle.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  handle.addEventListener("dragenter", (event) => {
    // highlight potential drop target when the draggable element enters it
    if (event.target.classList.contains("draggable-handle")) {
      event.target.classList.add("dragover");
    }
  });
  handle.addEventListener("dragleave", (event) => {
    // reset background of potential drop target when the draggable element leaves it
    if (event.target.classList.contains("draggable-handle")) {
      event.target.classList.remove("dragover");
    }
  });
  handle.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.target.classList.contains("draggable-handle")) {
      event.target.classList.remove("dragover");
    }
    dstCodeBlockId = event.target.id;
    console.log(`Dragged from ${srcCodeBlockId} to ${dstCodeBlockId}`);
    //connectDivs(srcCodeBlockId, dstCodeBlockId);
    connections.push({ src: srcCodeBlockId, dst: dstCodeBlockId });
  });
};

const wireEval = (code) => {
  code.eval = (content) => {
    console.log("wiring this node: ", code)
    const src = code;
    src.classList.remove("dirty");
    src.classList.remove("error");
    if(!content){
      content = src.dataset.eval_string
    }
    //src.dataset.eval_string = content; This seems unneeded?
    console.log("Have evaluation string set to", src.dataset.eval_string);
    src.dataset.index = "[?]";
    // TODO(me) Should add the index already on construction as empty and
    // populate on iteration
    src.hover_title = src.dataset.eval_string;
    let [assignment, rvalue, evaluation, error] = evalExpr(content);
    if (error) {
      src.hover_title = error;
      src.classList.add("error");
      return;
    }
    src.innerHTML = "";
    if (assignment) {
      src.appendChild(assignment);
      src.appendChild(rvalue);
      assignment.insertAdjacentHTML("afterend", " = ");
    } else {
      //src.appendChild(evaluation);
      for (let i = 0; i < evaluation.length; i++) {
        const line = evaluation[i];
        src.appendChild(line);
        if (i != evaluation.length - 1) {
          const lineBreak = document.createElement("br");
          src.appendChild(lineBreak);
        }
      }
    }
    wireHandle(src);
  };

  observer.observe(code, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  console.log("Added the observer");
  code.addEventListener("pointerenter", (ev) => {
    codeInfoTimeout = setTimeout(() => {
      const mouseX = ev.clientX;
      const mouseY = ev.clientY;
      if (code.contains(ev.target)) {
        codeInfo.style.left = mouseX + 2 + "px";
        codeInfo.style.top = mouseY + 2 + "px";
        codeInfo.textContent = ev.target.hover_title + `\nid: ${code.id}`;
        codeInfo.classList.add("show");
        code.appendChild(codeInfo);
        const svg = document.getElementById("svgConnections");
        svg.innerHTML = "";
        for (let connection of connections) {
          let { src, dst } = connection;
          connectDivs(src, dst);
        }
        if (connections) {
          document.getElementById("svgContainer").classList.add("show");
        }
      }
    }, 1000);
  });

  code.addEventListener("pointerleave", () => {
    clearTimeout(codeInfoTimeout);
    codeInfo.classList.remove("show");
    document.getElementById("svgContainer").classList.remove("show");
    content.appendChild(codeInfo);
  });

  code.addEventListener("click", (ev) => {
    console.log("Handling click")
    const src = ev.srcElement;
    if(src.editing){
      return
    }
    src.innerText = src.dataset.eval_string
    src.editing = true
  })

  code.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const src = ev.srcElement;
    src.editing = false
    const textNodes = [];
    let content;
    // Having an assignment node, makes this tricky to handle. An assignment node behaves differently, since it has a span.
    // Worse, if a single line assignment block becomes multiline… hell will break loose here too.
    const hasAssignment = Array.from(src.childNodes).some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === "SPAN" &&
        node.classList.contains("assignment")
    );
    if (hasAssignment) {
      content = src.innerText; // This still won't work going from single to multiple lines
    } else {
      for (const node of src.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node.textContent);
        }
      }
      content = textNodes.join("\n");
    }
    console.log(`Invoking evaluation for ${src} for ${content}`);
    src.eval(content);
    console.log(`Updating internal evaluation string to ${content}`);
    src.dataset.eval_string = content;
    const codes = document.querySelectorAll(".code.wired");
    let i = 0;
    for (let cod of codes) {
      // TODO(me) This would look way better as an HTML hover
      cod.dataset.index = `[${i}]`;
      cod.hover_title = `${cod.dataset.index} ${cod.dataset.eval_string}`;
      i++;
      if (cod == src) {
        console.log("Skipping self");
        continue;
      } else {
        cod.eval();
      }
    }
  });
};

function connectDivs(div1Id, div2Id) {
  const div1 = document.getElementById(div1Id);
  const div2 = document.getElementById(div2Id);

  const div1Rect = div1.getBoundingClientRect();
  const div2Rect = div2.getBoundingClientRect();

  const x1 = div1Rect.left - 4;
  const y1 = div1Rect.top - 4;
  const x2 = div2Rect.left - 4;
  const y2 = div2Rect.top - 4;

  createSVGLine(x1, y1, x2, y2);
}

function createSVGLine(x1, y1, x2, y2) {
  const svgContainer = document.getElementById("svgConnections");
  const svgNS = "http://www.w3.org/2000/svg";
  const line = document.createElementNS(svgNS, "line");

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.classList.add("connecting-line");

  svgContainer.appendChild(line);
}

const eval_ = {
  text: ["eval", "🧮"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const code = wireEvalFromScratch();
    if (!code) {
      console.log("Ain't code there dude");
      return;
    }
    wireEval(code);
  },
  description: "Evaluate (JavaScript) the selected text",
  el: "u",
};

const dark = {
  text: ["dark"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    for (let body of bodies) {
      body.classList.toggle("dark");
    }

    config.dark = !config.dark;
  },
  description: "Toggle dark/light mode  (stored in config)",
  el: "u",
};

const buttons = [
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
  split,
  eval_,
  close_,
  clear,
  gfont,
  save,
  load,
];
let helpTable = [`<tr><td>Command</td><td>Help</td></tr>`];
for (let button of buttons) {
  const commandText = button.text.join("/");
  const tr = `<tr><td>${commandText}</td><td>${button.description}</td></tr>`;
  helpTable.push(tr);
}
document.getElementById("commands").innerHTML = helpTable.join("\n");
