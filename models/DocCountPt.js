const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountPtSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountPt = mongoose.model('doccountpts', DocCountPtSchema);