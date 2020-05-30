const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Heat = require('./Heat');
const HeatLoc = require('./HeatLoc');
var s3bucket = require('../middleware/s3bucket');
const _ = require('lodash');

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
    
    let certificateId = doc._id;
    let cif = doc.cif;
    let projectId = doc.projectId;
    
    findHeatLocs(cif, projectId).then( () => {
        findHeats(certificateId).then( () => {
            s3bucket.deleteCif(certificateId).then( () => next())
        });
    });
});

function findHeatLocs(cif, projectId) {
    return new Promise(function (resolve) {
        if (!cif || !projectId) {
            resolve();
        } else {
            HeatLoc.find({ cif: cif, projectId: projectId }, function (err, heatlocs) {
                if (err || _.isEmpty(heatlocs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heatlocs.map(heatloc => myPromises.push(deleteHeatLoc(heatloc._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeatLoc(heatlocId) {
    return new Promise(function(resolve) {
        if (!heatlocId) {
            resolve();
        } else {
            HeatLoc.findByIdAndDelete(heatlocId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findHeats(certificateId) {
    return new Promise(function (resolve) {
        if (!certificateId) {
            resolve();
        } else {
            Heat.find({ certificateId: certificateId }, function (err, heats) {
                if (err || _.isEmpty(heats)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heats.map(heat => myPromises.push(deleteHeat(heat._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeat(heatId) {
    return new Promise(function(resolve) {
        if (!heatId) {
            resolve();
        } else {
            Heat.findByIdAndDelete(heatId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Certificate = mongoose.model('certificates', CertificateSchema);