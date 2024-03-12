import { loadHash } from "./load.js";

import { createPanel } from "./commands.js";
// Can't import from dom due to circular dependency?
import weave from "./weave.js";
import { hookBody } from "./internal.js";

// Globals that are used everywhere

// Helper for inline code

let $ = {
  cel: (s) => document.createElement(s),
  ctn: (s) => document.createTextNode(s),
  byId: (s) => document.getElementById(s),
  qs: (s) => document.querySelector(s),
};

createPanel("b0", weave.buttons());

// I keep a stack of the last 2 bodies clicked, for printing.
// Sometimes I want to cancel the shift. And stopPropagation/stopImmediatePropagation don't work
// Dunno why

// More issues with propagation

// For tracking drag between code blocks

// Initialise data from the URL string
loadHash();

for (let body of weave.bodies()) {
  hookBody(body);
}

window.weave = weave;
