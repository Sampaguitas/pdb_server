const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocCountPnSchema = new Schema({
  _id: {
      type: String,
      required: true
  },
  seq: {
      type: Number,
      default: 0
  }
});


//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = DocCountPn = mongoose.model('doccountpns', DocCountPnSchema);