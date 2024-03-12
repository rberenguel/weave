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
};

export default weave;
