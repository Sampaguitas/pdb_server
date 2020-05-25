const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HeatLoc = require('./HeatLoc');
const _ = require('lodash');

//Create Schema
const HeatSchema = new Schema({
    heatNr: {
        type: String,
        required: true
    },
    inspQty: {
        type: Number,
    },
    certIndex: {
        type: String,
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

HeatSchema.virtual('sub', {
    ref: "subs",
    localField: "subId",
    foreignField: "_id",
    justOne: true
});

HeatSchema.set('toJSON', { virtuals: true });

HeatSchema.post('findOneAndDelete', function (doc, next) {
    findHeatLocs(doc.heatNr, doc.poId).then( () => next());
});

function findHeatLocs(heatNr, poId) {
    return new Promise(function (resolve) {
        if (!heatNr || !poId) {
            resolve();
        } else {
            HeatLoc.find({ heatNr: heatNr, poId: poId }, function (err, heatlocs) {
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
            HeatLoc.findOneAndDelete({_id : heatlocId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Heat = mongoose.model('heats', HeatSchema);