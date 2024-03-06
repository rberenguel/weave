function getClosestBodyContainer(element) {
  let currentParent = element.parentNode;
  while (currentParent !== document.documentElement) {
    if(currentParent.classList.contains("body") && currentParent.id.startsWith("b")){
      return currentParent
    }
    currentParent = currentParent.parentNode;
  }

  return null;
}

const wireEverything = () => {
  // We have loaded stuff. Let's wire the code blocks:
  const codes = document.querySelectorAll("code.wired");
  let i = 0;
  for (let cod of codes) {
    cod.hover_title = `[${i}] ${cod.hover_title}`;
    i++;
    console.log("data", cod.dataset.eval_string);
    wireEval(cod, cod.dataset.eval_string);
    cod.eval(cod, cod.dataset.eval_string);
  }
  // Now lets wire the buttons
  const aliveButtons = document.querySelectorAll("div>.alive");
  console.log("Wiring all these:")
  console.log(aliveButtons)
  for (let aliveButton of aliveButtons){
    for (let button of buttons) {
      // This could be sped up by reversing the indexing
      if (button.text.includes(aliveButton.dataset.action)) {
        aliveButton.onmousedown = button.action;
      }
    }
  }
}

function loadHash() {
  const currentHash = window.location.hash.substring(1);
  const decodedHash = decodeURIComponent(currentHash);
  const splitHash = decodedHash.split("\u2223");

  if (splitHash.length > 1) {
    let bodiesData = JSON.parse(splitHash[1]);
    for (let n = 1; n < bodiesData.length; n++) {
      const div = document.createElement("div");
      div.classList.add("body");
      div.classList.add("dark");
      div.classList.add("serif");
      div.contentEditable = true;
      div.id = `b${n}`;
      document.body.appendChild(div);
    }
    config = JSON.parse(splitHash[0]);
    setConfig(config);

    for (let id in bodiesData) {
      console.log(id);
      let bodyData = bodiesData[id];
      console.log(bodyData);
      let body = document.querySelector(`#b${id}`);
      body.innerHTML = bodyData["data"];
      console.log(bodyData["data"]);
      body.style.width = bodyData["width"];
      body.style.height = bodyData["height"];
      body.style.fontSize = bodyData["fontSize"];
    }
    wireEverything();
  } else {
    setConfig({});
    for (let body of bodies) {
      body.innerHTML = decodedHash;
    }
  }
}

function setConfig(config) {
  console.log("Setting config to ", config);
  if (config.dark === undefined || config.dark) {
    console.log(bodies);
    for (let body of bodies) {
      console.log(body);
      body.classList.add("dark");
    }
  } else {
    for (let body of bodies) {
      body.classList.remove("dark");
    }
  }
  if (config.mono) {
    for (let body of bodies) {
      body.classList.add("mono");
    }
  } else {
    for (let body of bodies) {
      body.classList.add("serif");
    }
  }
  document.body.style.fontSize = `${config.fontsize}px`;
  //body.style.width = `${config.width}px`;
}
