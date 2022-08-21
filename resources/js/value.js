class Value {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    if (this.type == "lambda") {
      return "λ" + this.value.vars.map(val => val.symbol).join(" ") + "." + "()";
    } else {
      return this.value;
    }
  }

  static exp(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      return new Value("num", lval.value ** rval.value);
    }

    return new Value("null", null);
  }

  static mul(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      return new Value("num", lval.value * rval.value);
    }

    return new Value("null", null);
  }

  static div(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      return new Value("num", lval.value / rval.value);
    }

    return new Value("null", null);
  }

  static add(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      return new Value("num", lval.value + rval.value);
    }

    return new Value("null", null);
  }

  static sub(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      return new Value("num", lval.value - rval.value);
    }

    return new Value("null", null);
  }

  static cos(val) {
    if (val.type == "num") {
      return new Value("num", Math.cos(val.value));
    }

    return new Value("null", null);
  }

  static sin(val) {
    if (val.type == "num") {
      return new Value("num", Math.sin(val.value));
    }

    return new Value("null", null);
  }

  static tan(val) {
    if (val.type == "num") {
      return new Value("num", Math.tan(val.value));
    }

    return new Value("null", null);
  }

  static ln(val) {
    if (val.type == "num") {
      return new Value("num", Math.log(val.value));
    }

    return new Value("null", null);
  }

  static log(val) {
    if (val.type == "num") {
      return new Value("num", Math.log10(val.value));
    }

    return new Value("null", null);
  }

  static log2(val) {
    if (val.type == "num") {
      return new Value("num", Math.log2(val.value));
    }

    return new Value("null", null);
  }

  static sqrt(val) {
    if (val.type == "num") {
      return new Value("num", Math.sqrt(val.value));
    }

    return new Value("null", null);
  }

  static cbrt(val) {
    if (val.type == "num") {
      return new Value("num", Math.cbrt(val.value));
    }

    return new Value("null", null);
  }
}
