const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Heat = require('./Heat');

//Create Schema
const CertificateSchema = new Schema({
    cif: {
        type: String,
    },
    hasFile: {
        type: Boolean,
        default: false
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

CertificateSchema.post('findOneAndDelete', function (doc, next) {
    removeHeats(doc.certificatedId)
    .then( () => next());
});

function removeHeats(certificateId) {
    return new Promise(function (resolve) {
        if (!certificateId) {
            resolve({
                isRejected: true,
                reason: 'No certificateId'
            });
        } else {
            Heat.deleteMany({ certificateId: _id }, function (err) {
                if (err) {
                    resolve({
                        isRejected: true,
                        reason: 'could not delete all Heats'
                    });
                } else {
                    resolve({
                        isRejected: false,
                        reason: ''
                    });
                }
            });
        }

    });
}

module.exports = Certificate = mongoose.model('certificates', CertificateSchema);