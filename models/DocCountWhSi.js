const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountWhSiSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountWhSi = mongoose.model('doccountwhsis', DocCountWhSiSchema);