const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//Create Schema
const PickItem = new Schema({
    qtyPrepared: {
        type: Number 
    },
    qtyPicked: {
        type: Number 
    },
    mirItemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'miritems',
        required: true  
    },
    locationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locations',
        required: true
    },
    pickticketId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'picktickets',
        required: true, 
    },
});

PickItem.virtual("location", {
    ref: "locations",
    localField: "locationId",
    foreignField: "_id",
    justOne: true
});

PickItem.virtual("miritem", {
    ref: "miritems",
    localField: "miritemId",
    foreignField: "_id",
    justOne: true
});

PickItem.set('toJSON', { virtuals: true });

module.exports = PickItem = mongoose.model('pickitems', PickItem);