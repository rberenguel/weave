import { loadHash } from "./load.js";

// Can't import from dom due to circular dependency?
import weave from "./weave.js";

// Globals that are used everywhere

// Helper for inline code

let $ = {
  cel: (s) => document.createElement(s),
  ctn: (s) => document.createTextNode(s),
  byId: (s) => document.getElementById(s),
  qs: (s) => document.querySelector(s),
};

weave.root = "content"

weave.createPanel(weave.root, "b0", weave.buttons(weave.root), weave);

loadHash();

for (let body of weave.bodies()) {
  weave.hookBody(body);
}

window.weave = weave;