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
};

function handleInput(key) {
  let display = document.getElementById("display");

  switch (key) {
    case 'AC':
      display.textContent = "";
      break;
    case '⌫':
      display.textContent = display.textContent.slice(0, -1);
      break;
    case '=':
      break;
    default:
      display.textContent += key;
      break;
  }
}

function handleButtonClick(e) {
  const key = e.currentTarget.textContent;
  handleInput(key);
}

function handleKeyPress(e) {
  const key = e.key;
  if (e.ctrlKey) return;

  if (key.length == 1 && key.match(/[a-zA-Z0-9()\.\s^+-]/i)) {
    e.preventDefault();
    handleInput(key);
  }

  const keyMap = {
    "*": "×",
    "/": "÷",
    "Backspace": "⌫",
  }

  if (keyMap[key]) {
    e.preventDefault();
    handleInput(keyMap[key])
  }
}

const btns = document.getElementsByClassName("btn");
for (const btn of btns) {
  btn.addEventListener('mousedown', handleButtonClick);
  btn.addEventListener('mousedown', riple);
}

document.addEventListener('keydown', handleKeyPress)
