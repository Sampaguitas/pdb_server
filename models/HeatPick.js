const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const HeatPickSchema = new Schema({
    inspQty: {
        type: Number,
    },
    heatlocId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'heatlocs',
        required: true
    },
    pickitemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pickitems',
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true
    }
});

HeatPickSchema.virtual('heatloc', {
    ref: "heatlocs",
    localField: "heatlocId",
    foreignField: "_id",
    justOne: true
});


HeatPickSchema.set('toJSON', { virtuals: true });

module.exports = HeatPick = mongoose.model('heatpicks', HeatPickSchema);