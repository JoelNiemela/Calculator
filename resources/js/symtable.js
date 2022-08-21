class Symtable {
  constructor(from = {}) {
    if (from instanceof Symtable) {
      this.lookuptable = {};
      this.parent = from;
    } else {
      this.lookuptable = from;
      this.parent = null;
    }
  }

  lookup(symbol) {
    if (this.lookuptable[symbol]) {
      return this.lookuptable[symbol];
    } else if (this.parent) {
      return this.parent.lookup(symbol);
    } else {
      return undefined;
    }
  }

  set(symbol, value) {
    if (this.lookuptable[symbol]) {
      return this.lookuptable[symbol] = value;
    } else if (this.parent && this.parent.lookup(symbol)) {
      return this.parent.set(symbol, value);
    } else {
      return this.lookuptable[symbol] = value;
    }
  }
}
