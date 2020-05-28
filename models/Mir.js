const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//Create Schema
const MirSchema = new Schema({
    lineNr: {
        type: Number,
        required: true,
    },
    qtyRequired: {
        type: Number,
        required: true,
    },
    netWeight: {
        type: Number,
        default: 0,
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos',
        required: true,
    },
    calloffId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'calloffs',
        required: true,
    }
});

MirSchema.set('toJSON', { virtuals: true });

module.exports = Mir = mongoose.model('mirs', MirSchema);