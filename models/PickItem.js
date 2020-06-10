const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const PickItemSchema = new Schema({
    qtyPrepared: {
        type: Number 
    },
    qtyPicked: {
        type: Number 
    },
    miritemId: {
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

PickItemSchema.virtual("location", {
    ref: "locations",
    localField: "locationId",
    foreignField: "_id",
    justOne: true
});

PickItemSchema.virtual("miritem", {
    ref: "miritems",
    localField: "miritemId",
    foreignField: "_id",
    justOne: true
});

PickItemSchema.set('toJSON', { virtuals: true });

module.exports = PickItem = mongoose.model('pickitems', PickItemSchema);