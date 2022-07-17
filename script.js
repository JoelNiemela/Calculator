let calcValue = [];
let caretPos = [0];

function caret(value) {
    return '<span class="caret">' + value + "</span>";
}

function caretUnder() {
    return '<span class="caret-under">\xa0</span>';
}

function superscript(value) {
  return "<sup>" + value + "</sup>";
}

function calcValueString(value, pos=[]) {
  const equals = (a, b) =>
    a.length === b.length &&
    a.every((v, i) => v === b[i]);

  if (typeof value == "string") {
    pos[pos.length-1]++;

    if (equals(pos, caretPos)) return caret(value);
    return value;
  }

  if (Array.isArray(value)) {
    let caretPrefix = "";
    if (equals([...pos, 0], caretPos)) {
      if (pos.length == 0 && value.length == 0) {
        caretPrefix = caret("\xa0");
      } else {
        caretPrefix = caret("");
      }
    }

    return caretPrefix + value.map((e, i) => calcValueString(e, [...pos, i])).join("");
  }

  if (typeof value == "object") {
    let caretPostfix = "";
    pos[pos.length-1]++;
    if (equals(pos, caretPos)) {
      if (pos.length == 0 && value.length == 0) {
        caretPostfix = caret("\xa0");
      } else {
        caretPostfix = caret("");
      }
    }
    pos[pos.length-1]--;

    let valueStr = calcValueString(value.value, pos);
    if (value.type == "super") return superscript(valueStr) + caretPostfix;
  }
}

function calcValueEquation(value) {
  if (typeof value == "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(e => calcValueEquation(e)).join("");
  }

  let valueStr = calcValueEquation(value.value);
  if (value.type == "super") return "^(" + valueStr + ")"
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

function getAt(pos, value=calcValue) {
  if (typeof value == "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const [index, ...subPos] = pos;
    const subValue = value[index];
    if (subPos.length) {
      return getAt(subPos, subValue);
    } else {
      return subValue;
    }
  }

  if (typeof value == "object") {
    return getAt(pos, value.value);
  }
}

function moveCaretForward() {
  const element = getAt(caretPos);

  if (element) {
    if (typeof element == "string") {
      caretPos[caretPos.length-1]++;
    } else if (typeof element == "object") {
      caretPos.push(0);
    }
  } else if (caretPos.length > 1) {
    caretPos.pop();
    caretPos[caretPos.length-1]++;
  }
}

function moveCaretBackward() {
  if (caretPos[caretPos.length-1] > 0) {
    caretPos[caretPos.length-1]--;

    const element = getAt(caretPos);
    if (typeof element == "object") {
      caretPos.push(element.value.length);
    }

    return;
  }

  if (caretPos.length > 1) {
    caretPos.pop();
  }
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

function update() {
  let display = document.getElementById("display");

  display.innerHTML = calcValueString(calcValue);

  let debug = document.getElementById("debug");
  let pos = document.getElementById("pos");

  if (debug) debug.innerHTML = calcValueEquation(calcValue);
  if (pos) pos.innerHTML = caretPos.join();
}

function handleInput(key) {

  switch (key) {
    case 'AC':
      calcValue = [];
      caretPos = [0];
      break;
    case '⌫':
      remove();
      break;
    case '^':
      insert({type: "super", value: []});
      caretPos.push(0);
      break;
    case '←':
      moveCaretBackward();
      break;
    case '→':
      moveCaretForward();
      break;
    case '↑':
      break;
    case '↓':
      break;
    case '=':
      break;
    default:
      insert(key);
      moveCaretForward();
      break;
  }

  update();
}

function handleButtonClick(e) {
  const key = e.currentTarget.textContent;
  handleInput(key);
}

function handleKeyPress(e) {
  const key = e.key;
  if (e.ctrlKey) return;

  if (key.length == 1 && key.match(/[a-zA-Z0-9()\.^+-]/i)) {
    e.preventDefault();
    handleInput(key);
  }

  const keyMap = {
    "*": "×",
    "/": "÷",
    "Backspace": "⌫",
    " ": "\xa0", // replace space with non-breaking space
    "ArrowLeft": "←",
    "ArrowRight": "→",
    "ArrowUp": "↑",
    "ArrowDown": "↓",
  };

  if (keyMap[key]) {
    e.preventDefault();
    handleInput(keyMap[key]);
  }
}

const btns = document.getElementsByClassName("btn");
for (const btn of btns) {
  btn.addEventListener('mousedown', handleButtonClick);
  btn.addEventListener('mousedown', riple);
}

document.addEventListener('keydown', handleKeyPress);

update();
