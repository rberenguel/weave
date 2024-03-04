// Reset stuff
function reset() {
  info.classList.remove("fades");
  info.innerText = "";
}

// Hook I use everywhere
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
    const parentBodyId = ev.srcElement.parentElement.parentElement.id;
    const parentBody = document.getElementById(parentBodyId);
    const fontSize = getComputedStyle(parentBody).fontSize;
    const newFontSize = parseFloat(fontSize) + 2;
    parentBody.style.fontSize = `${newFontSize}px`;
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

const eval_ = {
  text: ["eval", "="],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    const selection = window.getSelection();
    const selectionText = selection+"";
    console.log("Evaluating "+selectionText)
    const evaluation = eval?.(selectionText);
    const matchesAssignment = selectionText.match(/(\w*)\s*=/);
    let assignment
    if(matchesAssignment){
      const variable = matchesAssignment[1];
      console.log("Has an equal, variable is named ", variable);
      assignment = document.createElement("span")
      assignment.classList.add("assignment");
      const assignmentText = document.createTextNode(`${variable} = `);
      assignment.appendChild(assignmentText);
    }
    const code = document.createElement("code");
    const text = document.createTextNode(evaluation);
    let range = selection.getRangeAt(0);
    const parentNode = range.startContainer.parentNode
    const tag = parentNode.tagName
    range.deleteContents();
    if(tag == "CODE"){
      parentNode.appendChild(text);
    } else {
      if(assignment){
        code.appendChild(assignment);
      }
      code.appendChild(text);
      range.insertNode(code);
      code.insertAdjacentHTML("beforebegin", "\u200b");
      code.insertAdjacentHTML("afterend", "\u200b");
    }
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

const fontdown = {
  text: ["fontdown"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    // TODO(me): This is hacky, if I wrap a button in italics for example 
    // this stops being valid as a parent id. It is probably better if
    // I can hook the action somehow to the parent directly?
    const parentBodyId = ev.srcElement.parentElement.parentElement.id;
    const parentBody = document.getElementById(parentBodyId);
    const fontSize = getComputedStyle(parentBody).fontSize;
    const newFontSize = parseFloat(fontSize) - 2;
    parentBody.style.fontSize = `${newFontSize}px`;
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
  eval_,
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
