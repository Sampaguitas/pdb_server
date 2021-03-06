const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountTrSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountTr = mongoose.model('doccounttrs', DocCountTrSchema);