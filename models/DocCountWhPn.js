const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountWhPnSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountWhPn = mongoose.model('doccountwhpns', DocCountWhPnSchema);