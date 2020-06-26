const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountWhPlSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountWhPl = mongoose.model('doccountwhpls', DocCountWhPlSchema);