const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const SubSchema = new Schema({
    vlDelDateExp: {
        type: Date,
    },
    supDelDateAct: {
        type: Date,
    },
    supDelDateExp: {
        type: Date,
    },
    rfiDateExp: {
        type: Date,
    },
    rfiDateAct: {
        type: Date,
    },
    inspRelDate: {
        type: Date,
    },
    rfiQty:{
        type: Number,
    },
    inspQty:{
        type: Number,
    },
    relQty: {
        type: Number,
    },
    inspector: {
        type: String,
    },
    rfsDateExp: {
        type: Date,
    },
    rfsDateAct: {
        type: Date,
    },
    shipDateAct: {
        type: Date,
    },
    etaDate: {
        type: Date,
    },
    shippedQty: {
        type: Number,
    },
    intComments: {
        type: String,
    },
    nfi: {
        type: Number,
    },
    heatNr: {
        type: String,
    },
    nfiDateExp: {
        type: Date,
    },
    destination: {
        type: String,
    },
    manufacturer: {
        type: String,
    },
    manufOrigin: {
        type: String,
    },
    udfSbX1: {
        type: String,
    },
    udfSbX2: {
        type: String,
    },
    udfSbX3: {
        type: String,
    },
    udfSbX4: {
        type: String,
    },
    udfSbX5: {
        type: String,
    },
    udfSbX6: {
        type: String,
    },
    udfSbX7: {
        type: String,
    },
    udfSbX8: {
        type: String,
    },
    udfSbX9: {
        type: String,
    },
    udfSbX10: {
        type: String,
    },
    udfSb91: {
        type: Number,
    },
    udfSb92: {
        type: Number,
    },
    udfSb93: {
        type: Number,
    },
    udfSb94: {
        type: Number,
    },
    udfSb95: {
        type: Number,
    },
    udfSb96: {
        type: Number,
    },
    udfSb97: {
        type: Number,
    },
    udfSb98: {
        type: Number,
    },
    udfSb99: {
        type: Number,
    },
    udfSb910: {
        type: Number,
    },
    udfSbD1: {
        type: Date,
    },
    udfSbD2: {
        type: Date,
    },
    udfSbD3: {
        type: Date,
    },
    udfSbD4: {
        type: Date,
    },
    udfSbD5: {
        type: Date,
    },
    udfSbD6: {
        type: Date,
    },
    udfSbD7: {
        type: Date,
    },
    udfSbD8: {
        type: Date,
    },
    udfSbD9: {
        type: Date,
    },
    udfSbD10: {
        type: Date,
    },
    supReadyDateExp: {
        type: Date,
    },
    supReadyDateAct: {
        type: Date,
    },
    shipDocSent: {
        type: Date,
    },
    shipDateExp: {
        type: Date,
    },
    vlDelDateAct: {
        type: Date,
    },
    commentsExp: {
        type: String,
    },
    commentsInsp: {
        type: String,
    },
    commentsLog: {
        type: String,
    },
    splitQty: {
        type: Number,
    },
    delivery: {
        type: String,
    },
    deliveryPos: {
        type: Number,
    },
    transport: {
        type: String,
    },
    transportPos: {
        type: Number,
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    po: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos' 
    }
});

module.exports = Sub = mongoose.model('subs', SubSchema);