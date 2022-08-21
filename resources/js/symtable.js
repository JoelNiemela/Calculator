class Symtable {
  constructor(from = null, lookuptable = {}) {
    this.lookuptable = lookuptable;
    this.parent = from;
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
