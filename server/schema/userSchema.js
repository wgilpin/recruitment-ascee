const gstore = require('gstore-node')();

const { Schema } = gstore;

const userSchema = new Schema({
  name: { type: String },
  token: { type: String },
  image: { type: String },
  main: { type: String },
  createdOn: { type: Date, default: gstore.defaultValues.NOW },
});

/**
 * Export the User Model
 * It will generate "User" entity kind in the Datastore
 */
module.exports = gstore.model('User', userSchema);
