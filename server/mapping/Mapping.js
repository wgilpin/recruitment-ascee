class Mapping {
  constructor() {
    this.left = {};
    this.right = {};
  }

  map(l, r) {
    this.left[l] = (this.left[l] || []).append(r);
    this.right[r] = (this.right[r] || []).append(l);
  }

  get(lOrR) {
    return this.left[lOrR] || this.right[lOrR];
  }

  unmap (l, r) {

  }
}

module.exports = Mapping;
