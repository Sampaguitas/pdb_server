const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const Heat = require('../models/Heat');

const ReturnSchema = new Schema({
    qtyReturn: {
        type: Number,
    },
    dateReturn: {
        type: Date,
    },
    remarks: {
        type: String,
    },
    waybillNr: {
        type: String,
    },
    waybillItem: {
        type: String,
    },
    contractor: {
        type: String,
    },
    poId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos' 
    },
});

ReturnSchema.virtual("heats", {
    ref: "heats",
    localField: "_id",
    foreignField: "returnId",
    justOne: false
});

ReturnSchema.set('toJSON', { virtuals: true });

ReturnSchema.post('findOneAndDelete', function(doc, next) {
    findHeats(doc._id).then( () => next()); 
});

function findHeats(returnId) {
    return new Promise(function (resolve) {
        if (!returnId) {
            resolve();
        } else {
            Heat.find({ returnId: returnId }, function (err, heats) {
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

module.exports = Return = mongoose.model('returns', ReturnSchema);