/* eslint-disable no-restricted-syntax */

const Store = require('./Store');
const logging = require('../src/Logging');


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

  isInvalid() {
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

  save() {
    this.checkKey();
    if (this.isInvalid()) {
      throw new Error(`Validation Error in type ${this.kind}`);
    }
    return Store.datastore.save({ key: this.key, data: this.values });
  }

  setFields(newData) {
    for (const f in newData) {
      if (Object.hasOwnProperty.call(this.fields, f)) {
        this.values[f] = newData[f];
      }
    }
    const err = this.isInvalid();
    if (err) {
      logging.error(`Validation Error ${err.join(' / ')}`);
      throw new Error(`Validation Error ${err.join(' / ')}`);
    }
  }

  set(key, value) {
    if (key in this.fields) {
      this.values[key] = value;
    } else {
      throw new Error(`Field not found ${key}`);
    }
  }

  get(id) {
    /*
     * get an object from the db and load all fields as per schema
     *
     * @param {number} id - datastore key id
     * @returns boolean "was found" ? true : false
     */
    try {
      if (id === undefined) {
        throw new Error(`${this.kind} get undefined id`);
      }
      this.key = Store.datastore.key({ path: [this.kind, parseInt(id, 10)] });
      return Store.datastore.get(this.key).then((dbEntities) => {
        const [dbEntity] = dbEntities;
        if (dbEntity) {
          this.setFields(dbEntity);
          return true;
        }
        return false;
      });
    } catch (err) {
      logging.error(`Model get error ${err.message}`);
      return false;
    }
  }

  update(data) {
    this.setFields(data);
    return this.save();
  }
}

module.exports = Model;
