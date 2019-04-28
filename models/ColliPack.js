const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ColliPackSchema = new Schema({
    plNr: {
        type: String,
    },
    colliNr: {
        type: Number,
    },
    type: {
        type: String,
    },
    length: {
        type: Number,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    grossWeight: {
        type: Number,
    },
    netWeight: {
        type: Number,
    },
    volume: {
        type: Number,
    },
    bundlesQty: {
        type: Number,
    },
    udfCpX1: {
        type: String,
    },
    udfCpX2: {
        type: String,
    },
    udfCpX3: {
        type: String,
    },
    udfCpX4: {
        type: String,
    },
    udfCpX5: {
        type: String,
    },
    udfCpX6: {
        type: String,
    },
    udfCpX7: {
        type: String,
    },
    udfCpX8: {
        type: String,
    },
    udfCpX9: {
        type: String,
    },
    udfCpX10: {
        type: String,
    },
    udfCp91: {
        type: Number,
    },
    udfCp92: {
        type: Number,
    },
    udfCp93: {
        type: Number,
    },
    udfCp94: {
        type: Number,
    },
    udfCp95: {
        type: Number,
    },
    udfCp96: {
        type: Number,
    },
    udfCp97: {
        type: Number,
    },
    udfCp98: {
        type: Number,
    },
    udfCp99: {
        type: Number,
    },
    udfCp910: {
        type: Number,
    },
    udfCpD1: {
        type: Date,
    },
    udfCpD2: {
        type: Date,
    },
    udfCpD3: {
        type: Date,
    },
    udfCpD4: {
        type: Date,
    },
    udfCpD5: {
        type: Date,
    },
    udfCpD6: {
        type: Date,
    },
    udfCpD7: {
        type: Date,
    },
    udfCpD8: {
        type: Date,
    },
    udfCpD9: {
        type: Date,
    },
    udfCpD10: {
        type: Date,
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'
    }
});

module.exports = ColliPack = mongoose.model('collipacks', ColliPackSchema);