class Value {
  constructor(type, value, unit = "unit") {
    this.type = type;
    this.value = value;
    this.unit = unit;
  }

  toString() {
    if (this.type == "lambda") {
      return "λ" + this.value.vars.map(val => val.symbol).join(" ") + "." + stringifyExp(this.value.exp);
    } else if (this.type == "num") {
      switch (this.unit) {
        case "unit": return this.value;
        case "deg": return this.value + "°";
        default:
          console.error("Unknown unit " + this.unit);
          return this.value;
        }
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
      if (lval.unit == "unit" && rval.unit == "unit") {
        return new Value("num", lval.value * rval.value);
      } else if (lval.unit != "unit" && rval.unit == "unit") {
        return new Value("num", lval.value * rval.value, lval.unit);
      } else if (lval.unit == "unit" && rval.unit != "unit") {
        return new Value("num", lval.value * rval.value, rval.unit);
      } else {
        return new Value("null", null);
      }
    }

    return new Value("null", null);
  }

  static div(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      if (lval.unit == "unit" && rval.unit == "unit") {
        return new Value("num", lval.value / rval.value);
      } else if (lval.unit != "unit" && rval.unit == "unit") {
        return new Value("num", lval.value / rval.value, lval.unit);
      } else {
        return new Value("null", null);
      }
    }

    return new Value("null", null);
  }

  static add(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      if (lval.unit == rval.unit) {
        return new Value("num", lval.value + rval.value, lval.unit);
      } else {
        return new Value("null", null);
      }
    }

    return new Value("null", null);
  }

  static sub(lval, rval) {
    if (lval.type == "num" && rval.type == "num") {
      if (lval.unit == rval.unit) {
        return new Value("num", lval.value - rval.value, lval.unit);
      } else {
        return new Value("null", null);
      }
    }

    return new Value("null", null);
  }

  static rad(val) {
    const angleBtn = document.getElementById("btn-angle")
    if (angleBtn.innerHTML == 'Rad') {
      return val;
    } else if (angleBtn.innerHTML == 'Deg') {
      return val * Math.PI/180.0;
    } else {
      console.error("Unknown angle type " + angleBtn.innerHTML);
      return val;
    }
  }

  static cos(val) {
    if (val.type == "num") {
      return new Value("num", Math.cos(Value.rad(val.value)));
    }

    return new Value("null", null);
  }

  static sin(val) {
    if (val.type == "num") {
      return new Value("num", Math.sin(Value.rad(val.value)));
    }

    return new Value("null", null);
  }

  static tan(val) {
    if (val.type == "num") {
      return new Value("num", Math.tan(Value.rad(val.value)));
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
