export { reset, common }

const info = document.querySelector("#info");

const reset = () => {
  info.classList.remove("fades");
  info.innerText = "";
  console.info("Resetted styles on info")
}

const common = (ev) => {
  reset();
  return ev.button !== 0;
}


