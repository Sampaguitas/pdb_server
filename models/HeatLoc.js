const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const HeatLocSchema = new Schema({
    cif: {
        type: String,
        required: true
    },
    heatNr: {
        type: String,
        required: true
    },
    inspQty: {
        type: Number,
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos',
        required: true
    },
    locationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locations',
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true
    }
});

HeatLocSchema.set('toJSON', { virtuals: true });

module.exports = HeatLoc = mongoose.model('heatlocs', HeatLocSchema);