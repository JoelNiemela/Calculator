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

    const str = value.map((e, i) => calcValueString(e, [...pos, i])).join("");
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
    if (value.type == "super") return superscript(valueStr) + caretPostfix;
    if (value.type == "sqrt") return sqrt(value.head, valueStr) + caretPostfix;
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
  if (value.type == "super") return "^(" + valueStr + ")"
  if (value.type == "sqrt") return "(" + valueStr + ")"
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

function tokenize(str) {
  const rules = [
    ["num", /^[0-9]*\.?[0-9]+/],
    ["var", /^[a-zA-ZΑ-Ωα-ω]+/],
    ["lpar", /^\(/],
    ["rpar", /^\)/],
    ["exp", /^\^/],
    ["mul", /^\×/],
    ["div", /^\÷/],
    ["add", /^\+/],
    ["sub", /^\-/],
    ["err", /^./],
  ];

  let pos = 0;
  let tokens = [];

  let token;
  while (pos < str.length) {
    for (const [type, regex] of rules) {
      if (token = str.slice(pos).match(regex)) {
        pos += token[0].length;
        tokens.push({type, value: token[0]});
        break;
      }
    }
  }

  return tokens;
}

function parse(tokens, prec=10) {
  if (prec == 0) {
    const token = tokens.shift();
    if (token?.type == "num") {
      return { type: "num", value: parseFloat(token.value) };
    } else if (token?.type == "var") {
      return { type: "var", symbol: token.value };
    } else if (token?.type == "lpar") {
      const exp = parse(tokens);
      const closePar = tokens.shift();
      if (closePar?.type == "rpar") {
        return { type: "par", exp: exp };
      } else {
        return { type: "par", exp: exp, err: "Unclosed parenthesis" };
      }
    }

    return { type: "null", value: null };
  }

  const ops = {
    '1': [],
    '2': [],
    '3': [],
    '4': ['exp'],
    '5': ['mul', 'div'],
    '6': ['add', 'sub'],
    '7': [],
    '8': [],
    '9': [],
    '10': [],
  };

  let lexp = parse(tokens, prec-1);

  let token = tokens.shift();
  while (ops[prec].includes(token?.type)) {
    const rexp = parse(tokens, prec-1);
    lexp = { type: token.type, lexp, rexp };
    token = tokens.shift();
  }

  if (token) tokens.unshift(token);
  return lexp;
}

function evaluate(exp, symtable) {
  switch (exp?.type) {
    case "num":
      return exp.value;
    case "var":
      return symtable[exp.symbol];
    case "null":
      return evaluate(exp.value, symtable);
    case "par":
      return evaluate(exp.exp, symtable);
    case "exp":
      return evaluate(exp.lexp, symtable) ** evaluate(exp.rexp, symtable);
    case "mul":
      return evaluate(exp.lexp, symtable) * evaluate(exp.rexp, symtable);
    case "div":
      return evaluate(exp.lexp, symtable) / evaluate(exp.rexp, symtable);
    case "add":
      return evaluate(exp.lexp, symtable) + evaluate(exp.rexp, symtable);
    case "sub":
      return evaluate(exp.lexp, symtable) - evaluate(exp.rexp, symtable);
  }
}

function calculate() {
  const str = calcValueEquation(calcValue);
  const tokens = tokenize(str);
  const tree = parse(tokens);
  const symtable = {
    "e": 2.71828182846,
    "π": 3.14159265359,
    "pi": 3.14159265359,
  };
  const value = evaluate(tree, symtable);
  return value;
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
    if (subIndex == 0) {
      if (arr[index].value.length == 0) {
        arr.splice(index, 1);
        caretPos.pop();
      } else {
        caretPos.pop();

        const element = getAt(caretPos);
        if (typeof element == "object" && element.type == "sqrt") {
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
        caretPos.push(element.value.length);
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
      insert({type: "super", value: []});
      caretPos.push(0);
      break;
    case '√':
      insert({type: "sqrt", head: "√", value: []});
      caretPos.push(0);
      break;
    case '∛':
      insert({type: "sqrt", head: "∛", value: []});
      caretPos.push(0);
      break;
    case '←':
      moveCaretBackward();
      break;
    case '→':
      moveCaretForward();
      break;
    case '=':
      calcValue = calculate().toString().split("");
      caretPos = [calcValue.length];
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

  if (key.length == 1 && key.match(/[a-zA-Z0-9()\.:+-]/i)) {
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
  btn.addEventListener('mousedown', riple);
}

document.addEventListener('keydown', handleKeyPress);

update();
