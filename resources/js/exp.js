function stringifyExp(exp) {
  switch (exp?.type) {
    case "num": return exp.value.toString();
    case "var": return exp.symbol;
    case "decl": return exp.lexp.symbol + ":" + stringifyExp(exp.rexp);
    case "lambda":
      return "λ" + exp.vars.map(val => val.symbol).join(" ") + "." + stringifyExp(exp.exp);
    case "fac": return "!" + stringifyExp(exp.exp);
    case "juxtra": return stringifyExp(exp.lexp) + " " + stringifyExp(exp.rexp);
    case "null": return "null";
    case "par": return "(" + stringifyExp(exp.exp) + ")";
    case "exp": return stringifyExp(exp.lexp) + "^" + stringifyExp(exp.rexp);
    case "mul": return stringifyExp(exp.lexp) + "×" + stringifyExp(exp.rexp);
    case "div": return stringifyExp(exp.lexp) + "÷" + stringifyExp(exp.rexp);
    case "add": return stringifyExp(exp.lexp) + "+" + stringifyExp(exp.rexp);
    case "sub": return stringifyExp(exp.lexp) + "-" + stringifyExp(exp.rexp);
  }
}
