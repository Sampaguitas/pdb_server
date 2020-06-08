const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const PickTicketSchema = new Schema({
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

PickTicketSchema.virtual("pickitems", {
    ref: "pickitems",
    localField: "_id",
    foreignField: "pickticketId",
    justOne: false
});

PickTicketSchema.virtual("mir", {
    ref: "mirs",
    localField: "mirId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.virtual("warehouse", {
    ref: "warehouses",
    localField: "warehouseId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.virtual("project", {
    ref: "projectId",
    localField: "projectId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.set('toJSON', { virtuals: true });

module.exports = PickTicket = mongoose.model('picktickets', PickTicketSchema);