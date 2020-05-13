const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const HeatSchema = new Schema({
    heatNr: {
        type: String,
        required: true
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos',
        required: true
    },
    subId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'subs',
        required: false
    },
    certificateId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'certificates',
        required: true
    }
});

HeatSchema.virtual('certificate', {
    ref: "certificates",
    localField: "certificateId",
    foreignField: "_id",
    justOne: true
});

HeatSchema.set('toJSON', { virtuals: true });

module.exports = Heat = mongoose.model('heats', HeatSchema);