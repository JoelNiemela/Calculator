let calcValue = [];
let caretPos = [0];

function calcValueString(value, pos=[]) {
    const equals = (a, b) =>
      a.length === b.length &&
      a.every((v, i) => v === b[i]);

  if (typeof value == "string") {
    pos[pos.length-1]++;

    if (equals(pos, caretPos)) return '<span class="caret">' + value + "</span>";
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((e, i) => calcValueString(e, [...pos, i])).join("");
  }

  return "<sup>" + calcValueString(value.value, pos) + "</sup>";
}

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

function moveCaret() {
  caretPos[caretPos.length-1]++;
}

function insert(value, arr=calcValue, pos=caretPos) {
  const [index, ...subIndex] = pos;

  if (subIndex.length > 0) {
    insert(value, arr[index].value, subIndex);
  } else {
    arr.splice(index, 0, value);
  }
}

function remove(arr=calcValue, pos=caretPos) {
  const [index, ...subIndex] = pos;

  if (subIndex.length > 0) {
    if (subIndex == 0 && arr[index].value.length == 0) {
      arr.splice(index, 1);
      caretPos.pop();
    } else {
      remove(arr[index].value, subIndex);
    }
  } else {
    if (index > 0) {
      arr.splice(index-1, 1);
      caretPos[caretPos.length-1]--;
    }
  }
}

function handleInput(key) {
  let display = document.getElementById("display");

  switch (key) {
    case 'AC':
      calcValue = [];
      break;
    case '⌫':
      remove();
      break;
    case '^':
      insert({type: "super", value: []});
      caretPos.push(0);
      break;
    case '=':
      break;
    default:
      insert(key);
      moveCaret();
      break;
  }

  display.innerHTML = calcValueString(calcValue);
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
