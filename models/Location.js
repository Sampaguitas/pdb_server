const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const LocationSchema = new Schema({
    hall: {
        type: Number,
        maxlength: 1,
        required: true
    },
    row: {
        type: Number,
        maxlength: 1,
        required: true
    },
    col: {
        type: Number,
        maxlength: 3,
        required: true
    },
    height: {
        type: Number,
        maxlength: 3,
    },
    tc: {
        type: String,
        maxlength: 1,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    areaId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'areas',
        required: true 
    }
});

LocationSchema.virtual('area', {
    ref: 'areas',
    localField: 'areaId',
    foreignField: '_id',
    justOne: true
});

LocationSchema.virtual('transactions', {
    ref: 'transactions',
    localField: '_id',
    foreignField: 'locationId',
    justOne: false
});

LocationSchema.set('toJSON', { virtuals: true });

module.exports = Location = mongoose.model('locations', LocationSchema);

