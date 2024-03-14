import { createPanel } from "./doms.js";
import { hookBody } from "./internal.js";

const weave = {
  bodies: () => document.getElementsByClassName("body"),
  buttons: () => [],
  // Base config
  config: {
    dark: true,
    mono: false,
    fontsize: getComputedStyle(document.body).fontSize,
  },
  internal: {
    preventFolding: false,
    cancelShifting: false,
    // TODO(me): API on top of this "click history"
    bodyClicks: ["b0", "b0"],
    clickedId: ["b0", "b0"],
  },
  createPanel: createPanel,
  hookBody: hookBody,
  root: null
};

export default weave;
