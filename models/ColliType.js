const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ColliTypeSchema = new Schema({
    type: {
        type: String
    },
    length: {
        type: Number
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    pkWeight: {
        type: Number
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    }
});

module.exports = ColliType = mongoose.model('collitypes', ColliTypeSchema);