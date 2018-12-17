class Store {
  constructor() {
    this.datastore = null;
  }

  connect(item) {
    this.datastore = item;
  }
}

const instance = new Store();
// Object.freeze(instance);

module.exports = instance;
