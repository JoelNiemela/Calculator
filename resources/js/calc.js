function tokenize(str) {
  const rules = [
    ["num", /^[0-9]*\.?[0-9]+/],
    ["lambda", /^λ/],
    ["var", /^[a-zA-ZΑ-Ωα-ω]+/],
    ["lpar", /^\(/],
    ["rpar", /^\)/],
    ["exp", /^\^/],
    ["mul", /^\×/],
    ["div", /^\÷/],
    ["add", /^\+/],
    ["sub", /^\-/],
    ["var", /^\√/],
    ["var", /^\∛/],
    ["fac", /^!/],
    ["decl", /^:/],
    ["dot", /^\./],
    ["ws", /^\s/],
    ["err", /^./],
  ];

  let pos = 0;
  let tokens = [];

  let token;
  while (pos < str.length) {
    for (const [type, regex] of rules) {
      if (token = str.slice(pos).match(regex)) {
        pos += token[0].length;
        if (type != "ws") tokens.push({type, value: token[0]});
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
    } else if (token?.type == "sub") {
      const lexp = { type: "num", value: 0.0 };
      const rexp = parse(tokens);
      return { type: "sub", lexp, rexp };
    } else if (token?.type == "lambda") {
      let token = tokens.shift();
      const vars = [];
      while (token?.type == "var") {
        vars.push({ type: "var", symbol: token.value });

        token = tokens.shift();
      }

      if (token?.type != "dot") {
        return { type: "lambda", vars, exp: { type: "null", value: null }, err: "Expected '.' (dot), found '" + token?.value + "' (" + token?.type + ")" };
      } else {
        const exp = parse(tokens);
        return { type: "lambda", vars, exp };
      }
    }

    return { type: "null", value: null };
  }

  const ops = {
    '1': [],
    '2': [],
    '3': ['fac'],
    '4': ['exp'],
    '5': ['mul', 'div'],
    '6': ['add', 'sub'],
    '7': [],
    '8': [],
    '9': [],
    '10': ['decl'],
  };

  let lexp = parse(tokens, prec-1);

  let token = tokens.shift();
  while (ops[prec].includes(token?.type)) {
    if (token?.type == 'fac') {
      lexp = { type: token.type, exp: lexp };
    } else {
      const rexp = parse(tokens, prec-1);
      lexp = { type: token.type, lexp, rexp };
    }

    token = tokens.shift();
  }

  // reinsert the lookahead token if it's not undefined
  if (token) tokens.unshift(token);

  if (ops[prec].includes('mul')) {
    // while there is another token and that token is not an operator (or a closing parenthesis)
    while (tokens.length > 0 && !Object.values(ops).flat().concat(['rpar']).includes(tokens[0]?.type)) {
      const rexp = parse(tokens, prec-1);
      lexp = { type: 'juxtra', lexp, rexp };
    }
  }

  return lexp;
}

function factorial(n){
    return (n <= 1) ? 1 : factorial(n - 1) * n;
}

function evaluate(exp, symtable) {
  switch (exp?.type) {
    case "num":
      return exp.value;
    case "var":
      return symtable.lookup(exp.symbol)?.value;
    case "decl":
      console.assert(exp.lexp.type == "var");
      let val = evaluate(exp.rexp, symtable);

      let type = typeof val;
      if (type == "object" && val.type == "lambda") {
        type = "lambda";
      }

      symtable.set(exp.lexp.symbol, {
        type: type,
        value: val,
      });

      return val;
    case "lambda":
      return exp;
    case "fac":
      return factorial(evaluate(exp.exp));
    case "juxtra":
      if (exp.lexp.type == "var" && symtable.lookup(exp.lexp.symbol)?.type == "func") {
        return symtable.lookup(exp.lexp.symbol).func(evaluate(exp.rexp, symtable));
      } else if (exp.lexp.type == "var" && symtable.lookup(exp.lexp.symbol)?.type == "lambda") {
        let lambda = symtable.lookup(exp.lexp.symbol).value;

        let args = {};
        let arg = evaluate(exp.rexp, symtable);

        let type = typeof arg;
        if (type == "object" && arg.type == "lambda") {
          type = "lambda";
        }

        args[lambda.vars[0].symbol] = {
          type: type,
          value: arg
        };

        return evaluate(lambda.exp, new Symtable(symtable, args));
      } else {
        return evaluate(exp.lexp, symtable) * evaluate(exp.rexp, symtable);
      }
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
    default:
      console.error("Error: unknown exp type '" + exp?.type + "'");
  }
}

const global_symtable = new Symtable(null, {
  "e": { type: "number", value: 2.71828182846 },
  "π": { type: "number", value: 3.14159265359 },
  "pi": { type: "number", value: 3.14159265359 },
  "cos" : { type: "func", func: Math.cos },
  "sin" : { type: "func", func: Math.sin },
  "tan" : { type: "func", func: Math.tan },
  "ln" : { type: "func", func: Math.ln },
  "log" : { type: "func", func: Math.log },
  "√" : { type: "func", func: Math.sqrt },
  "∛" : { type: "func", func: Math.cbrt },
  "sqrt" : { type: "func", func: Math.sqrt },
  "cbrt" : { type: "func", func: Math.cbrt },
});

function calculate() {
  const str = calcValueEquation(calcValue);
  const tokens = tokenize(str);
  const tree = parse(tokens);
  const value = evaluate(tree, global_symtable);

  // Don't return a value if the top-level exp was a decl
  if (tree.type == "decl") {
    return "";
  }

  return value;
}
