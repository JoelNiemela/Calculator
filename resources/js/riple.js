function getElementOffset(element) {
    const de = document.documentElement;
    const box = element.getBoundingClientRect();
    const top = box.top + window.pageYOffset - de.clientTop;
    const left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left };
}

function riple(e) {
  const btn = e.currentTarget;
  const x = e.pageX - getElementOffset(btn).left;
  const y = e.pageY - getElementOffset(btn).top;
 
  let riple = document.createElement("span");
  riple.classList.add("impl-riple-effect");
  riple.style.left = x + "px";
  riple.style.top = y + "px";

  btn.appendChild(riple);

  setTimeout(function() {
    riple.remove();
  }, 2000);
}

const ripleBtns = document.getElementsByClassName("btn");
for (const btn of ripleBtns) {
  btn.addEventListener('mousedown', riple);
}
