const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HeatPick = require('./HeatPick');
const _ = require('lodash');

const PickItemSchema = new Schema({
    qtyPrepared: {
        type: Number 
    },
    qtyPicked: {
        type: Number 
    },
    miritemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'miritems',
        required: true  
    },
    locationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locations',
        required: true
    },
    pickticketId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'picktickets',
        required: true, 
    },
});

PickItemSchema.virtual("location", {
    ref: "locations",
    localField: "locationId",
    foreignField: "_id",
    justOne: true
});

PickItemSchema.virtual("miritem", {
    ref: "miritems",
    localField: "miritemId",
    foreignField: "_id",
    justOne: true
});

PickItemSchema.set('toJSON', { virtuals: true });

PickItemSchema.post('findOneAndDelete', function (doc, next) {
    const pickitemId = doc._id;
    findHeatPicks(pickitemId).then( () => next());
});

function findHeatPicks(pickitemId) {
    return new Promise(function (resolve) {
        if (!pickitemId) {
            resolve();
        } else {
            HeatPick.find({ pickitemId: pickitemId }, function (err, heatpicks) {
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

module.exports = PickItem = mongoose.model('pickitems', PickItemSchema);