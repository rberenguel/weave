export { gsave, isave, save, saveAll, saveAll_, serializeSaveData, showModalAndGetFilename };

import weave from "./weave.js";

import { set } from "./libs/idb-keyval.js";

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

const getBasicSaveString = (body) => {
  let b = {};
  b["data"] = body.innerHTML;
  b["width"] = body.parentElement.style.width;
  b["height"] = body.parentElement.style.height;
  b["x"] = body.parentElement.dataset.x;
  b["y"] = body.parentElement.dataset.y;
  b["folded"] = body.parentElement.classList.contains("folded");
  b["fontSize"] = body.style.fontSize;
  b["fontFamily"] = body.style.fontFamily;
  b["gfont"] = body.dataset.gfont;
  b["filename"] = body.dataset.filename;
  const savedata = JSON.stringify(b);
  console.log("Generated save data");
  return btoa(encodeURIComponent(savedata));
};

function showModalAndGetFilename(placeholder, callback) {
  const inp = document.createElement("input");
  inp.classList.add("dark");
  inp.classList.add("filename");
  inp.placeholder = placeholder;
  const modal = document.getElementById("modal");
  modal.appendChild(inp);
  modal.style.display = "block";
  inp.focus()
  inp.addEventListener("keydown", function (ev) {
    console.log(ev);
    if (ev.key === "Enter") {
      ev.preventDefault();
      const filename = inp.value;
      callback(filename);
      modal.style.display = "none";
      modal.innerHTML = ""
    }
  });
}

const setFilenameInBodyDataset = (body) => {
  if (body.dataset.filename) {
    const filename = body.dataset.filename;
    body.dataset.filename = filename;
    return Promise.resolve([filename, body]);
  }

  // Need filename from modal
  return new Promise((resolve) => {
    showModalAndGetFilename("filename?", function (filenameFromModal) {
      body.dataset.filename = filenameFromModal;
      resolve([filenameFromModal, body]);
    });
  });
};

const filenameToSelectedBodyFromSelection = () => {
  const selection = window.getSelection() + "";

  if (selection.length > 0) {
    // Selection exists, proceed (synchronous)
    const filename = selection;
    const body = document.getElementById(weave.internal.bodyClicks[1]);
    body.dataset.filename = filename;
    return Promise.resolve([filename, body]); // Wrap in a resolved promise
  }

  // No selection - asynchronous part
  const body = document.getElementById(weave.internal.bodyClicks[0]);

  // This block will be reused…
  return setFilenameInBodyDataset(body);
};

const isave = {
  text: ["isave"],
  action: (ev) => {
    ev.preventDefault(); // To allow focusing on input
    filenameToSelectedBodyFromSelection()
      .then(([filename, body]) => {
        const saveString = getBasicSaveString(body);
        set(filename, saveString)
          .then(() => console.log("Data saved in IndexedDb"))
          .catch((err) => console.log("Saving in IndexedDb failed", err));
      })
      .catch((error) => {
        console.error("Error resolving the filename promise", error);
      });
  },
  description: "Save a pane to IndexedDB",
  el: "u",
};

function processFiles() { 
  let allFiles = [];
  let promiseChain = Promise.resolve(); // Start with a resolved promise

  for (const bodyId of weave.internal.group) {
    const body = document.getElementById(bodyId);
    // Chain promises sequentially
    promiseChain = promiseChain.then(() => { 
      body.closest(".body-container").classList.add("highlighted")
      return setFilenameInBodyDataset(body).then(([filename, _]) => {
        const saveString = getBasicSaveString(body);
        allFiles.push(body.dataset.filename);
        body.closest(".body-container").classList.remove("highlighted")
        return set(filename, saveString); 
      });
    }).then(() => {
      console.log("Data saved in IndexedDb");
    }).catch((err) => {
      console.error("Saving in IndexedDb failed", err);
    });
  }

  return promiseChain.then(() => {
    return allFiles; 
  });
}


const gsave = {
  text: ["gsave"],
  action: (ev) => {
    ev.preventDefault(); // To allow focusing on input
    if (!weave.internal.group || weave.internal.group.size == 0) {
      return;
    }
    // First make sure all panes are saved properly in processFiles
    processFiles().then((allFiles) => {
      showModalAndGetFilename("group name?", (groupname) => {
        set(groupname, "g:" + allFiles.join("|"))
          .then(() => console.log("Group data saved in IndexedDb"))
          .catch((err) => console.log("Saving in IndexedDb failed", err));
      });
    })
  },
  description:
    "Save a group of panes to IndexedDB. There is no equivalent for file though",
  el: "u",
};

const save = {
  text: ["save", "💾"],
  action: (ev) => {
    ev.preventDefault(); // To allow focusing on input
    filenameToSelectedBodyFromSelection()
      .then(([filename, body]) => {
        const saveString = getBasicSaveString(body);
        const downloadLink = document.createElement("a");
        const fileData = "data:application/json;base64," + saveString;
        console.log(saveString);
        downloadLink.href = fileData;
        downloadLink.download = filename;
        downloadLink.click();
      })
      .catch((error) => {
        console.error("Error resolving the filename promise", error);
      });
  },
  description: "Save a pane to disk, you won't be choosing where though",
  el: "u",
};

const serializeSaveData = (bodies, config) => {
  let savedata = [];
  for (let body of bodies) {
    let b = {};
    let contents;
    if (body.dataset.filename && body.dataset.filename.includes("menu")) {
      contents = body.innerHTML;
    } else {
      contents = body.dataset.filename || "";
    }
    // TODO clean up this repetition, write a centralised getter/setter
    b["data"] = contents;
    b["width"] = body.parentElement.style.width;
    b["height"] = body.parentElement.style.height;
    b["folded"] = body.parentElement.classList.contains("folded");
    b["fontSize"] = body.style.fontSize;
    b["fontFamily"] = body.style.fontFamily;
    b["gfont"] = body.dataset.gfont;
    b["filename"] = body.dataset.filename;
    savedata.push(b);
  }

  const currentConfig = JSON.stringify(config);
  const encodedBodiesContent = encodeURIComponent(
    `${currentConfig}\u2223${JSON.stringify(savedata)}`
  );
  return encodedBodiesContent;
};

function saveAll() {
  const serializedSaveData = serializeSaveData(weave.bodies(), weave.config);
  window.location.hash = serializedSaveData;
  info.innerHTML = "&#x1F4BE;";
  info.classList.add("fades");
}
