const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//Create Schema
const MirItemSchema = new Schema({
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
    mirId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'mirs',
        required: true,
    }
});

MirItemSchema.set('toJSON', { virtuals: true });

module.exports = MirItem = mongoose.model('miritems', MirItemSchema);