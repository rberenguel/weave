// highlight.js

// commands.js

// Globals that are used everywhere

// Helper for inline code

let $ = {
  cel: (s) => document.createElement(s),
  ctn: (s) => document.createTextNode(s),
  byId: (s) => document.getElementById(s),
  qs: (s) => document.querySelector(s),
}

// HTML elements of interest
let bodies = document.getElementsByClassName("body");
const helpDiv = document.querySelector("#help");
const info = document.querySelector("#info");

// I keep a stack of the last 2 bodies clicked, for printing.
let bodyClicks = ["b0", "b0"]

// For tracking drag between code blocks
let srcCodeBlockId, dstCodeBlockId
let connections = [];

// I use this separator in many places
const zwsr = () => document.createTextNode("\u200b");

// Base config
let config = {
  dark: true,
  mono: false,
  fontsize: getComputedStyle(document.body).fontSize,
};

// load.js

// Initialise data from the URL string
loadHash();

// Refresh the list of bodies
bodies = document.getElementsByClassName("body");

helpDiv.onmousedown = (ev) => {
  if (ev.button !== 0) {
    return;
  }
  helpDiv.style.display = "none";
  document.getElementById("content").classList.remove("blur");
};

function saveAll() {
  let savedata = [];
  // The regex is to remove "live" buttons from saving as "live" (but dead) buttons
  // TODO(me) A nicer way to fix is that on-load I should re-live buttons. But that
  // was a bit annoying for a first iteration.
  //const regex =
  //  /<div class="wrap"><[^\s]+ class="alive">\s*([^\s]+)\s*<\/[^>]+><\/div>/g;
  for (let body of bodies) {
    //const streamlined = body.innerHTML
    //  .replaceAll(regex, "$1")
    //  .replaceAll("\u2009", "");
    let b = {};
    b["data"] = body.innerHTML;
    b["width"] = body.style.width;
    b["height"] = body.style.height;
    b["folded"] = body.classList.contains("folded");
    b["fontSize"] = body.style.fontSize;
    b["fontFamily"] = body.style.fontFamily;
    b["gfont"] = body.dataset.gfont;
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

const hookBodies = () => {
  for (let body of bodies) {
    if(!body.clickAttached){
      body.addEventListener("click", (ev) => {
        bodyClicks.unshift(body.id);
        bodyClicks.length = 2
      });
      body.clickAttached = true;
    }
    if(!body.dblClickAttached){
      body.addEventListener("dblclick", (ev) => {
        const selection = window.getSelection().toString().replace(/\s+/g, "").length
        if (selection.length > 0){
          console.log(`You have selected something ('${selection}'), not folding`);
          return;
        }
        body.classList.toggle("folded");
        if(body.classList.contains("folded")){
          body.dataset.height = body.style.height;
          body.style.height = "";
        } else {
          body.style.height = body.dataset.height;
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
          node.dataset.action = `${selectedText}`
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
    body.addEventListener("paste", (event)=> {
      // Paste takes a slight bit to modify the DOM, if I trigger
      // the wiring without waiting a pasted button might not be wired
      // properly.
      setTimeout(() => {
        wireEverything(); 
      }, 100);
    });
  }  
}

hookBodies();

// This is the main hook that makes buttons work

// This is the stack machine for typing and Markdown things
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

for (let body of bodies) {
  hookBody(body);
}
