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

function sqrt(head, value) {
  return head + '<span class="sqrt">' + value + "</span>";
}

function implicit(value) {
  return '<span class="implicit">' + value + "</span>";
}

function red(value) {
  return '<span style="color: red;">' + value + "</span>";
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

    let str = value.map((e, i) => calcValueString(e, [...pos, i])).join("");
    if (pos.length > 0 && str.length == 0) {
      str = '□';
    }
    const { lpar, rpar } = balanceParens(str);
    return implicit("(".repeat(lpar)) + caretPrefix + str + implicit(")".repeat(rpar));
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
    if (value.mode) {
      if (value.type == "super") return "^(" + caretPostfix;
      if (value.type == "sqrt") return sqrt(value.head + "(", "") + caretPostfix;
      if (value.type == "func") return value.head + "(" + caretPostfix;
    } else {
      if (value.type == "super") return superscript(valueStr) + caretPostfix;
      if (value.type == "sqrt") return sqrt(value.head, valueStr) + caretPostfix;
      if (value.type == "func") return value.head + "(" + valueStr + ")" + caretPostfix;
    }
  }
}

function calcValueEquation(value) {
  if (typeof value == "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const str = value.map(e => calcValueEquation(e)).join("");
    const { lpar, rpar } = balanceParens(str);
    return "(".repeat(lpar) + str + ")".repeat(rpar);
  }

  let valueStr = calcValueEquation(value.value);
  if (value.mode) {
    if (value.type == "super") return "^(";
    if (value.type == "sqrt") return "(" + value.head + "(";
    if (value.type == "func") return "(" + value.head + "(";
  } else {
    if (value.type == "super") return "^(" + valueStr + ")";
    if (value.type == "sqrt") return "(" + value.head + "(" + valueStr + "))";
    if (value.type == "func") return "(" + value.head + "(" + valueStr + "))";
  }
}

function balanceParens(str) {
  let lpar = 0;
  let rpar = 0;
  let parens = 0;
  for (const char of str) {
    switch (char) {
      case '(':
        parens++;
        break;
      case ')':
        parens--;
        break;
    }

    if (parens < 0) {
      lpar++;
      parens++;
    }
  }

  rpar = Math.max(parens);

  return { lpar, rpar };
}

function getAt(pos, value=calcValue) {
  if (pos.length == 0) {
    return value;
  }

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

function getObjAt(pos) {
  const arrIndex = pos.slice();
  const index = arrIndex.pop();
  let obj = getAt(arrIndex);

  return { obj, index };
}

function getArrAt(pos) {
  let { obj, index } = getObjAt(pos);
  if (typeof obj == "object" && !Array.isArray(obj)) {
    obj = obj.value;
  }

  return { arr: obj, index };
}

function moveCaretForward() {
  const element = getAt(caretPos);

  if (element) {
    if (typeof element == "object") {
      if (element.mode) {
        caretPos[caretPos.length-1]++;
      } else {
        caretPos.push(0);
      }
    } else if (typeof element == "string") {
      caretPos[caretPos.length-1]++;
    }
  } else if (caretPos.length > 1) {
    caretPos.pop();
    caretPos[caretPos.length-1]++;
  }
}

function moveCaretBackward(length=1) {
  if (length == 0) {
    return;
  }

  if (caretPos[caretPos.length-1] > 0) {
    caretPos[caretPos.length-1]--;

    const element = getAt(caretPos);
    if (typeof element == "object" && !element.mode) {
      caretPos.push(element.value.length);
    }
  } else if (caretPos.length > 1) {
    caretPos.pop();
  }

  moveCaretBackward(length-1);
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
    if (subIndex == 0) {
      if (arr[index].value.length == 0) {
        arr.splice(index, 1);
        caretPos.pop();
      } else {
        caretPos.pop();

        const element = getAt(caretPos);
        if (typeof element == "object" && element.type != "super") {
          arr.splice(index, 1, ...element.value);
        }
      }
    } else {
      remove(arr[index].value, subIndex);
    }
  } else {
    if (index > 0) {
      caretPos[caretPos.length-1]--;

      const element = getAt(caretPos);
      if (typeof element == "object") {
        if (element.mode) {
            arr.splice(index-1, 1);
        } else {
          if (element.type == "func") {
            caretPos[caretPos.length-1] += element.value.length + 1;
            arr.splice(index, 0, ...element.value);
            element.mode = true;
            element.value = [];
          } else {
            caretPos.push(element.value.length);
          }
        }
      } else {
        arr.splice(index-1, 1);
      }
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

function inputMode() {
  const modeBtn = document.getElementById("btn-mode");
  if (modeBtn.innerText == "ƒ()") {
    return true;
  } else if (modeBtn.innerText == "ƒ") {
    return false;
  }

  console.log("Error");
  return false;
}

function getType(key) {
  switch (key) {
    case 'xʸ':
      return "super";
    case '√':
    case '∛':
      return "sqrt";
    case 'sin':
    case 'cos':
    case 'tan':
    case 'ln':
    case 'log':
    case 'log₂':
      return "func";
    default:
      return "null";
  }
}

function getHead(key) {
  switch (key) {
    case 'xʸ':
      return undefined;
    default:
      return key;
  }
}

function isFunction(str) {
  switch (str) {
    case 'sin':
    case 'cos':
    case 'tan':
    case 'ln':
    case 'log':
    case 'log₂':
      return true;
    default:
      return false;
  }
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
    case 'xʸ':
    case '√':
    case '∛':
    case 'sin':
    case 'cos':
    case 'tan':
    case 'ln':
    case 'log':
    case 'log₂':
      insert({type: getType(key), head: getHead(key), value: [], mode: inputMode()});
      if (inputMode()) {
        moveCaretForward();
      } else {
        caretPos.push(0);
      }
      break;
    case '←':
      moveCaretBackward();
      break;
    case '→':
      moveCaretForward();
      break;
    case 'ƒ':
      const modeBtn = document.getElementById("btn-mode");
      modeBtn.innerText = "ƒ()";
      break;
    case 'ƒ()':
      const modeBtnParen = document.getElementById("btn-mode");
      modeBtnParen.innerText = "ƒ";
      break;
    case 'Rad':
      const radBtn = document.getElementById("btn-angle");
      radBtn.innerText = "Deg";
      break;
    case 'Deg':
      const degBtn = document.getElementById("btn-angle");
      degBtn.innerText = "Rad";
      break;
    case '=':
      calcValue = calculate().toString().split("");
      caretPos = [calcValue.length];
      break;
    case '(':
      const arrObj = getArrAt(caretPos);
      const fnArr = arrObj.arr;
      const fnIndex = arrObj.index;

      let fn = "";
      let searchFnArr = fnArr.slice(0, fnIndex).reverse();
      searchFnArr.some(char => {
        if (typeof char != "string") {
          return true;
        }

        if (!char.match(/[a-zA-Z]/i)) {
          return true;
        }

        fn = char + fn;

        if (isFunction(fn) || fn == "sqrt" || fn == "cbrt") {
          return true;
        }
      });

      if (isFunction(fn)) {
        const length = fn.length;
        fnArr.splice(fnIndex-length, length, {type: "func", head: fn, value: [], mode: true});

        moveCaretBackward(length-1);
      } else if (fn == "sqrt") {
        const length = fn.length;
        fnArr.splice(fnIndex-length, length, {type: "sqrt", head: "√", value: [], mode: true});

        moveCaretBackward(length-1);
      } else if (fn == "cbrt") {
        const length = fn.length;
        fnArr.splice(fnIndex-length, length, {type: "sqrt", head: "∛", value: [], mode: true});

        moveCaretBackward(length-1);
      } else {
        insert('(');
        moveCaretForward();
      }
      break;
    case ')':
      const { arr, index } = getArrAt(caretPos);

      let begin;
      let obj;
      let searchArr = arr.slice(0, index).reverse();
      let parens = 0;
      const last = index-1;
      if (searchArr.some((e, i) => {
        obj = e;
        begin = last-i;
        if (e == ")") parens--;
        if (e == "(") parens++;
        return (typeof e == "object" && e.mode)
            || (e == "(" && parens > 0);
      })) {
        if (obj == "(") {
          if (arr[index] == ')') {
            moveCaretForward();
          } else {
            insert(')');
            moveCaretForward();
          }
        } else {
          const length = index-begin;

          const [_head, ...value] = arr.splice(begin, length);
          arr.splice(begin, 0, {type: obj.type, head: obj.head, value, mode: false});

          moveCaretBackward(length-1);
        }
      } else {
        const { obj, index } = getObjAt(caretPos);
        if (typeof obj == "object" && obj.type == "func" && index == obj.value.length) {
          moveCaretForward();
        } else {
          insert(')');
          moveCaretForward();
        }
      }

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
  let key = e.key;
  if (e.ctrlKey) return;

  if (e.altKey) {
    const altMap = {
      "l": "λ",
      "p": "π",
    };

    key = altMap[key] ?? key;
  }

  if (key.length == 1 && key.match(/[a-zA-Z0-9()\.:!\+\-λπ]/i)) {
    e.preventDefault();
    handleInput(key);
  }

  const keyMap = {
    "*": "×",
    "/": "÷",
    "^": "xʸ",
    "Backspace": "⌫",
    "Enter": "=",
    " ": "\xa0", // replace space with non-breaking space
    "ArrowLeft": "←",
    "ArrowRight": "→",
  };

  if (keyMap[key]) {
    e.preventDefault();
    handleInput(keyMap[key]);
  }
}

const btns = document.getElementsByClassName("btn");
for (const btn of btns) {
  btn.addEventListener('mousedown', handleButtonClick);
}

document.addEventListener('keydown', handleKeyPress);

update();
