export { save, saveAll, saveAll_ };

import weave from "./weave.js";

const saveAll_ = {
  text: ["saveAll"],
  action: (ev) => {
    if (common(ev)) {
      return;
    }
    saveAll();
  },
  description:
    "Save the current changes and config in the URL, so it survives browser crashes",
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
      body = document.getElementById(weave.bodyClicks[1]);
    } else {
      body = document.getElementById(weave.bodyClicks[0]);
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

function saveAll() {
  let savedata = [];
  for (let body of weave.bodies()) {
    let b = {};
    let contents;
    if (body.dataset.filename && body.dataset.filename.includes("menu")) {
      contents = body.innerHTML;
    } else {
      contents = body.dataset.filename || "";
    }
    b["data"] = contents;
    b["width"] = body.style.width;
    b["height"] = body.style.height;
    b["folded"] = body.classList.contains("folded");
    b["fontSize"] = body.style.fontSize;
    b["fontFamily"] = body.style.fontFamily;
    b["gfont"] = body.dataset.gfont;
    b["filename"] = body.dataset.filename;
    savedata.push(b);
  }

  const currentConfig = JSON.stringify(weave.config);
  const encodedBodiesContent = encodeURIComponent(
    `${currentConfig}\u2223${JSON.stringify(savedata)}`
  );

  window.location.hash = encodedBodiesContent;
  info.innerHTML = "&#x1F4BE;";
  info.classList.add("fades");
}
