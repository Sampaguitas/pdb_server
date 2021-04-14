const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountWhSmSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});

module.exports = DocCountWhSm = mongoose.model('doccountwhsms', DocCountWhSmSchema);