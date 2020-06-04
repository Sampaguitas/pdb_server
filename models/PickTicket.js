const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//Create Schema
const PickTicket = new Schema({
    pickNr: {
        type: Number 
    },
    isProcessed: {
        type: Boolean,
    },
    mirId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'mirs',
        required: true, 
    },
    warehouseId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'warehouses',
        required: true  
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true
    },
});

PickTicket.virtual("pickitems", {
    ref: "pickitems",
    localField: "_id",
    foreignField: "pickticketId",
    justOne: false
});

PickTicket.set('toJSON', { virtuals: true });

module.exports = PickTicket = mongoose.model('picktickets', PickTicket);