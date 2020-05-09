const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CertificateSchema = new Schema({
    cif: {
        type: String,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true
    },
});

CertificateSchema.virtual('heats', {
    ref: "heats",
    localField: "_id",
    foreignField: "certificateId",
    justOne: false
});

CertificateSchema.set('toJSON', { virtuals: true });

module.exports = Certificate = mongoose.model('certificates', CertificateSchema);