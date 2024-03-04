const pythonKeywords = [
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
];

const javascriptKeywords = [
  "abstract",
  "arguments",
  "await",
  "boolean",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "number",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "shorthand",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
];
const keywords = pythonKeywords.concat(javascriptKeywords);
const hilite = () => {
  const pres = document.getElementsByTagName("pre");
  for (let pre of pres) {
    let text = pre.innerHTML;
    for (let kw of keywords) {
      text = text.replaceAll(kw + " ", `<span class='keyword'>${kw}</span> `);
    }
    text = text.replaceAll(
      /[^>]("[^"]*")[^>]/g,
      "<span class='string'>$1</span>"
    );
    //text = text.replaceAll(/[^>]({)[^>]/g, "<span class='brace'>$1</span>")
    //text = text.replaceAll(/[^>](})[^>|$]/g, "<span class='brace'>$1</span>")
    //text = text.replaceAll(/[^>](\;)$/g, "<span class='brace'>$1</span>")
    pre.innerHTML = text;
  }
};
const mono = {
  text: ["mono"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    for (let body of bodies) {
      body.classList.remove("serif");
      body.classList.remove("mono");
      body.classList.add("mono");
    }

    config.mono = true;
  },
  description: "Switch to a monospace font (Monoid) (stored in config)",
  el: "u",
};

const help = {
  text: ["help"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    helpDiv.style.display = "block";
    body.classList.add("blur");
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
    body.classList.remove("mono");
    body.classList.remove("serif");
    body.classList.add("serif");
    config.mono = false;
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
  text: ["fontup"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const fontSize = getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(fontSize) + 2;
    document.body.style.fontSize = `${newFontSize}px`;
    config.fontsize = newFontSize;
  },
  description: "Increase the document font by 2 pixels (stored in config)",
  el: "u",
};

/*const narrow = {
    text: ["narrow"],
    action: (ev) => {
      if (common(ev)) {
        return;
      }
      const width = getComputedStyle(body).width;
      const newWidth = parseFloat(width) * 0.9;
      body.style.width = `${newWidth}px`;
      config.width = newWidth;
    },
    description: "Reduce the typing area width by 10% (stored in config)",
    el: "u",
  };*/

/*const widen = {
    text: ["widen"],
    action: (ev) => {
      if (common(ev)) {
        return;
      }
      const width = getComputedStyle(body).width;
      const newWidth = parseFloat(width) * 1.1;
      body.style.width = `${newWidth}px`;
      config.width = newWidth;
    },
    description: "Increase the typing area width by 10% (stored in config)",
    el: "u",
  };*/

const print_ = {
  text: ["print", "🖨️"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    window.print();
  },
  description: "Trigger the print dialog",
  el: "u",
};

const save_ = {
  text: ["save", "💾"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    save();
    ev.stopPropagation();
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
    document.body.appendChild(div);
    hookBody(div);
    bodies = document.getElementsByClassName("body");
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

const fontdown = {
  text: ["fontdown"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const fontSize = getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(fontSize) - 2;
    document.body.style.fontSize = `${newFontSize}px`;
    config.fontsize = newFontSize;
  },
  description: "Decrease the document font by 2 pixels (stored in config)",
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
  save_,
  bold,
  italic,
  underline,
  help,
  split,
  //narrow,
  //widen,
];
let helpTable = [`<tr><td>Command</td><td>Help</td></tr>`];
for (let button of buttons) {
  const commandText = button.text.join("/");
  const tr = `<tr><td>${commandText}</td><td>${button.description}</td></tr>`;
  helpTable.push(tr);
}
document.getElementById("commands").innerHTML = helpTable.join("\n");

const currentHash = window.location.hash.substring(1);
const decodedHash = decodeURIComponent(currentHash);
let bodies = document.getElementsByClassName("body");
const helpDiv = document.querySelector("#help");
const info = document.querySelector("#info");
const zwsr = () => document.createTextNode("\u200b");
let config = {
  dark: true,
  mono: false,
  fontsize: getComputedStyle(document.body).fontSize,
};
const splitHash = decodedHash.split("\u2223");
if (splitHash.length > 1) {
  let bodiesData = JSON.parse(splitHash[1]);
  for (let n = 1; n < bodiesData.length; n++) {
    const div = document.createElement("div");
    div.classList.add("body");
    div.classList.add("dark");
    div.classList.add("serif");
    div.contentEditable = true;
    div.id = `b${n}`;
    document.body.appendChild(div);
  }
  config = JSON.parse(splitHash[0]);
  setConfig(config);

  for (let id in bodiesData) {
    console.log(id);
    let bodyData = bodiesData[id];
    console.log(bodyData);
    let body = document.querySelector(`#b${id}`);
    body.innerHTML = bodyData["data"];
    console.log(bodyData["data"]);
    body.style.width = bodyData["width"];
    body.style.height = bodyData["height"];
  }
} else {
  setConfig({});
  for (let body of bodies) {
    body.innerHTML = decodedHash;
  }
}
// Refresh the list of bodies
bodies = document.getElementsByClassName("body");

helpDiv.onmousedown = (ev) => {
  if (ev.button !== 0) {
    return;
  }
  helpDiv.style.display = "none";
  body.classList.remove("blur");
};

function setConfig(config) {
  console.log("Setting config to ", config);
  if (config.dark === undefined || config.dark) {
    console.log(bodies);
    for (let body of bodies) {
      console.log(body);
      body.classList.add("dark");
    }
  } else {
    for (let body of bodies) {
      body.classList.remove("dark");
    }
  }
  if (config.mono) {
    for (let body of bodies) {
      body.classList.add("mono");
    }
  } else {
    for (let body of bodies) {
      body.classList.add("serif");
    }
  }
  document.body.style.fontSize = `${config.fontsize}px`;
  //body.style.width = `${config.width}px`;
}
function save() {
  // Uh, the regex has issues with the hat in the bookmarklet…
  let savedata = [];
  const regex =
    /<div class="wrap"><[^\s]+ class="alive">\s*([^\s]+)\s*<\/[^>]+><\/div>/g;
  for (let body of bodies) {
    const streamlined = body.innerHTML
      .replaceAll(regex, "$1")
      .replaceAll("\u2009", "");
    let b = {};
    b["data"] = streamlined;
    b["width"] = body.style.width;
    b["height"] = body.style.height;
    savedata.push(b);
  }

  const currentConfig = JSON.stringify(config);
  const encodedBodiesContent = encodeURIComponent(
    `${currentConfig}\u2223${JSON.stringify(savedata)}`
  );

  window.location.hash = encodedBodiesContent;
  info.innerHTML = "&#x1F4BE;";
  info.classList.add("fades");
}
function reset() {
  info.classList.remove("fades");
  info.innerText = "";
}
function common(ev) {
  reset();
  return ev.button !== 0;
}
for (let body of bodies) {
  body.addEventListener("dblclick", (event) => {
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
    }
  });
}
let keyStack = {};
let listing = {};
const hookBody = (body) => {
  keyStack[body.id] = ["Enter"]; // TODO Fishy on load though
  listing[body.id] = false; // TODO Horrible state machine
  body.addEventListener("keyup", (event) => {
    const ek = event.key; // TODO ref
    if (event.ctrlKey && event.key === "s") {
      save();
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
    console.log(event.key);
    console.log(keyStack);
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
for (let body of bodies) {
  hookBody(body);
}
