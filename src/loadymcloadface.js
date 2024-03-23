export { iload, iloadIntoBody };

import weave from "./weave.js";
import { get, entries } from "./libs/idb-keyval.js";
import { showModalAndGetFilename } from "./save.js";
import { enterKeyDownEvent } from "./commands_base.js";
import { parseIntoWrapper } from "./parser.js";
import { wireEverything } from "./load.js";


const iloadIntoBody = (filename, body) => {
    console.log(filename)
  get(filename).then((filecontent) => {
    console.info("Loaded from IndexedDb");
    console.log(filecontent)
    console.log(atob(filecontent))
    console.log(decodeURIComponent(atob(filecontent)))
    parseIntoWrapper(decodeURIComponent(atob(filecontent)), body);
    wireEverything(weave.buttons(weave.root));
  });
};

const iload = {
  text: ["iload"],
  action: (ev) => {
    const body = document.getElementById(weave.internal.bodyClicks[0]);
    entries().then((entries) => {
      console.log(entries);
      for (const [key, value] of entries) {
        if (value.startsWith("g:")) {
          continue;
        }
        const k = document.createTextNode(key);
        const div = document.createElement("div");
        div.classList.add("hoverable");
        div.appendChild(k);
        const modal = document.getElementById("modal");
        modal.appendChild(div);
        div.addEventListener("click", (ev) => {
          const inp = document.querySelector("input.filename");
          inp.value = key;
          modal.innerHTML = "";
          inp.dispatchEvent(enterKeyDownEvent);
        });
      }
      const hr = document.createElement("hr");
      modal.appendChild(hr);
      showModalAndGetFilename("filename?", (filename) => {
        console.info(`Loading ${filename} from IndexedDB`);
        iloadIntoBody(filename, body);
      });
    });
  },
  description: "Load a pane to disk, you won't be choosing where though",
  el: "u",
};
