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
    ["sqrt", /^\√/],
    ["cbrt", /^\∛/],
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
        return { type: "par", exp };
      } else {
        return { type: "par", exp, err: "Unclosed parenthesis" };
      }
    } else if (token?.type == "sqrt") {
      const exp = parse(tokens);
      return { type: "sqrt", exp };
    } else if (token?.type == "cbrt") {
      const exp = parse(tokens);
      return { type: "cbrt", exp };
    } else if (token?.type == "sub") {
      const lexp = { type: "num", value: 0.0 };
      const rexp = parse(tokens);
      return { type: "sub", lexp, rexp };
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
    case "sqrt":
      return Math.sqrt(evaluate(exp.exp, symtable));
    case "cbrt":
      return Math.cbrt(evaluate(exp.exp, symtable));
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
