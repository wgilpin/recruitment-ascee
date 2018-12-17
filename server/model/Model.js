/* eslint-disable no-restricted-syntax */

const Store = require('./Store');


class Field {
  constructor(name, type = 'string', required = true) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}

class Model {
  constructor() {
    this.schema = {};
    this.fields = {};
    this.values = {};
    this.key = {};
    this.String = typeof 'asd';
    this.Boolean = typeof true;
    this.Date = Date;
    this.kind = 'ABSTRACT';
    for (const f in this) {
      if (f instanceof Field) {
        this.fields[f] = f;
        this.values[f] = null;
      }
    }
  }

  addField(name, type = 'string', required = true, defaultValue = null) {
    this.fields[name] = new Field(name, type, required);
    this.values[name] = defaultValue;
    // this.types[typeof this] = (this.types[typeof this] || {});
  }

  validate() {
    // check all fields
    for (const f in this.fields) {
      if (Object.hasOwnProperty.call(this.fields, f)) {
        const thisType = typeof this.values[f];
        if (thisType !== this.fields[f].type) {
          return false;
        }
        if (f.required && this.values[f] == null) {
          return false;
        }
      }
    }
    return true;
  }

  checkKey() {
    if (this.key) {
      return true;
    }
    this.key = Store.datastore.key(this.kind);
    return true;
  }

  async save() {
    this.checkKey();
    this.validate();
    await Store.datastore.save({ key: this.key, data: this.values });
  }

  setFields(newData) {
    console.log(newData)
    for (const f in this.fields) {
      if (Object.hasOwnProperty.call(this.fields, f)) {
        console.log(`value ${f}=${newData[f]}`);
        this.values[f] = newData[f];
      }
    }
    const err = this.validate();
    if (err) {
      console.log(`Validation Error ${err}`);
      throw err;
    }
  }

  async get(id) {
    this.key = Store.datastore.key({ path: [this.kind, id] });
    let dbEntity;
    try {
      [dbEntity] = await Store.datastore.get(this.key);
      this.setFields(dbEntity);
    } catch (err) {
      console.log(`datastore get not found: ${err}`);
    }
  }

  async update(data) {
    this.setFields(data);
    return this.save();
  }
}

module.exports = Model;
