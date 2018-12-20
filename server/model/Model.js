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
    this.kind = 'ABSTRACT';
    for (const f in this) {
      if (f instanceof Field) {
        this.fields[f] = f;
        this.values[f] = null;
      }
    }
  }

  static get Types() {
    return {
      String: typeof 'asd',
      Boolean: typeof true,
      Number: typeof 123,
      Any: 'Any',
    };
  }

  addField(name, type = 'string', required = true, defaultValue = null) {
    this.fields[name] = new Field(name, type, required);
    this.values[name] = defaultValue;
    // this.types[typeof this] = (this.types[typeof this] || {});
  }

  validate() {
    // check all fields
    // returns either false (passes) or an array of error messages
    const errors = [];
    for (const f in this.fields) {
      if (Object.hasOwnProperty.call(this.fields, f)) {
        const field = this.fields[f];
        const value = this.values[f];
        const thisType = typeof value;
        if (!value) {
          if (field.required) {
            // a required value is missing
            errors.push(`${f}: ${f.type}, req: ${f.required} Required value not present`);
          }
        } else if (thisType !== field.type && field.type !== Model.Types.Any) {
          // value present but wrong type
          errors.push(`${f}: ${f.type}, req: ${f.required} Failed on value ${this.values[f]}`);
        }
      }
    }
    return errors.length ? errors : false;
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
    const err = this.validate();
    await Store.datastore.save({ key: this.key, data: this.values });
    return err;
  }

  setFields(newData) {
    for (const f in newData) {
      if (Object.hasOwnProperty.call(this.fields, f)) {
        this.values[f] = newData[f];
      }
    }
    const err = this.validate();
    if (err) {
      console.log(`Validation Error ${err.join(' / ')}`);
      throw new Error(`Validation Error ${err.join(' / ')}`);
    }
  }


  async get(id) {
    /*
     * get an object from the db and load all fields as per schema
     *
     * @param {number} id - datastore key id
     * @returns boolean "was found" ? true : false
     */
    this.key = Store.datastore.key({ path: [this.kind, parseInt(id, 10)] });
    let dbEntity;
    try {
      [dbEntity] = await Store.datastore.get(this.key);
      if (dbEntity) {
        this.setFields(dbEntity);
        return true;
      }
    } catch (err) {
      console.log(`datastore get not found: ${err}`);
      return false;
    }
    return false;
  }

  async update(data) {
    this.setFields(data);
    return this.save();
  }
}

module.exports = Model;
