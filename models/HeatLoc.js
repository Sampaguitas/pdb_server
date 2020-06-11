const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HeatPick = require('./HeatPick');
const _ = require('lodash');

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

HeatLocSchema.virtual('heatpicks', {
    ref: "heatpicks",
    localField: "_id",
    foreignField: "heatlocId",
    justOne: false
});

HeatLocSchema.set('toJSON', { virtuals: true });


HeatLocSchema.post('findOneAndDelete', function (doc, next) {
    findHeatPicks(doc._id).then( () => next());
});

function findHeatPicks(heatlocId) {
    return new Promise(function (resolve) {
        if (!heatlocId) {
            resolve();
        } else {
            HeatPick.find({ heatlocId: heatlocId }, function (err, heatpicks) {
                if (err || _.isEmpty(heatpicks)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heatpicks.map(heatpick => myPromises.push(deleteHeatPick(heatpick._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeatPick(heatpickId) {
    return new Promise(function(resolve) {
        if (!heatpickId) {
            resolve();
        } else {
            HeatPick.findByIdAndDelete(heatpickId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = HeatLoc = mongoose.model('heatlocs', HeatLocSchema);