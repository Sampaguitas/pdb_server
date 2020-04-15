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
    },
    type: {
        type: String,
    },
    areaId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'areas' 
    }
});

LocationSchema.virtual('area', {
    ref: 'areas',
    localField: 'areaId',
    foreignField: '_id',
    justOne: true
});

LocationSchema.set('toJSON', { virtuals: true });

module.exports = Location = mongoose.model('locations', LocationSchema);

