export { isave, save, saveAll, saveAll_, serializeSaveData };

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

const filenameToSelectedBodyFromSelection = () => {
  // If there is no text selected, use the filename from the panel.
  // If there is no text selected, and the panel has no filename, use om.json
  const selection = window.getSelection() + "";
  let body;
  let filename = "om.json";
  let selected = false;
  if (selection.length > 0) {
    filename = selection;
    body = document.getElementById(weave.internal.bodyClicks[1]);
  } else {
    body = document.getElementById(weave.internal.bodyClicks[0]);
    if (body.dataset.filename) {
      filename = body.dataset.filename;
    }
  }
  body.dataset.filename = filename;
  return [filename, body];
};

function storeValueInIndexedDB(dbName, storeName, key, value) {
  const request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = (event) => {
    console.info("Creating object store in indexeddb");
    const db = event.target.result;
    db.createObjectStore(storeName);
  };

  request.onerror = (event) => {
    console.error("Error opening database:", event);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(storeName, "readwrite");

    transaction.onerror = (event) => {
      console.error("Error storing value:", event);
    };

    transaction.oncomplete = () => {
      console.log("Value stored successfully in", dbName, storeName);
    };

    const objectStore = transaction.objectStore(storeName);
    objectStore.put(value, key);
  };
}

const isave = {
  text: ["isave"],
  action: (ev) => {
    const [filename, body] = filenameToSelectedBodyFromSelection();
    const saveString = getBasicSaveString(body);
    set(filename, saveString)
      .then(() => console.log("Data saved in IndexedDb"))
      .catch((err) => console.log("Saving in IndexedDb failed", err));
  },
  description: "Save a pane to IndexedDB",
  el: "u",
};

const save = {
  text: ["save", "💾"],
  action: (ev) => {
    const [filename, body] = filenameToSelectedBodyFromSelection();
    const saveString = getBasicSaveString(body);
    const downloadLink = document.createElement("a");
    const fileData = "data:application/json;base64," + saveString;
    console.log(saveString)
    downloadLink.href = fileData;
    downloadLink.download = filename;
    downloadLink.click();
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
