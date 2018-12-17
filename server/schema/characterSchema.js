const gstore = require('gstore-node')();

const { Schema } = gstore;

//  Cache Schema
const characterSchema = new Schema({

  // from Info()
  ancestry_id: { type: Number },
  birthday: { type: Date },
  bloodline_id: { type: Number },
  corporation_id: { type: Number },
  description: { type: String },
  gender: { type: String },
  name: { type: String },
  race_id: { type: Number },

  // from Portrait()
  px128x128: { type: String },
  px256x256: { type: String },
  px512x512: { type: String },
  px64x64: { type: String },
  cachedOn: { type: Date, default: gstore.defaultValues.NOW },
});

module.exports = gstore.model('Character', characterSchema);
