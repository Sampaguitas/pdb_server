const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ReturnSchema = new Schema({
    qtyReturn: {
        type: Number,
    },
    dateReturn: {
        type: Date,
    },
    remarks: {
        type: String,
    },
    waybillNr: {
        type: String,
    },
    waybillItem: {
        type: String,
    },
    contractor: {
        type: String,
    },
    poId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos' 
    },
});

module.exports = Return = mongoose.model('returns', ReturnSchema);