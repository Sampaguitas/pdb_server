const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PickItem = require('./PickItem');
const _ = require('lodash');

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

HeatPickSchema.post('findOneAndDelete', function (doc, next) {
    const pickitemId = doc.pickitemId;
    PickItem.findById(pickitemId).populate('pickticket').exec(function(err, pickitem) {
        if(err || !pickitem || (pickitem.hasOwnProperty('pickticket') && !!pickitem.pickticket.isProcessed)) {
            next();
        } else {
            getQtyPicked(pickitemId).then(qtyPicked => {
                updateQtyPicked(qtyPicked, pickitemId).then( () => next());
            });
        }
    });
});

HeatPickSchema.post('findOneAndUpdate', function (doc, next) {
    const pickitemId = doc.value.pickitemId;
    PickItem.findById(pickitemId).populate('pickticket').exec(function(err, pickitem) {
        if(err || !pickitem || (pickitem.hasOwnProperty('pickticket') && !!pickitem.pickticket.isProcessed)) {
            next();
        } else {
            getQtyPicked(pickitemId).then(qtyPicked => {
                updateQtyPicked(qtyPicked, pickitemId).then( () => next());
            });
        }
    });
});

module.exports = HeatPick = mongoose.model('heatpicks', HeatPickSchema);

function getQtyPicked(pickitemId) {
    return new Promise (function(resolve) {
        HeatPick.find({pickitemId: pickitemId}).exec(function (err, res) {
            if (err || _.isEmpty(res)) {
                resolve(0);
            } else {
                resolve(res.reduce(function (acc, cur) {
                    if (!!cur.inspQty) {
                        acc += cur.inspQty;
                    }
                    return acc;
                }, 0));
            }
        });
    });
}

function updateQtyPicked(qtyPicked, pickitemId) {
    return new Promise (function (resolve) {
        PickItem.findByIdAndUpdate(pickitemId, { $set: { qtyPicked: qtyPicked} }, function (err) {
            if (err) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}