const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HeatLoc = require('./HeatLoc');
const PickItem = require('./PickItem');
const Transaction = require('./Transaction');
const _ = require('lodash');

//Create Schema
const LocationSchema = new Schema({
    hall: {
        type: Number,
        maxlength: 1,
        required: true
    },
    row: {
        type: Number,
        maxlength: 1,
        required: true
    },
    col: {
        type: Number,
        maxlength: 3,
        required: true
    },
    height: {
        type: Number,
        maxlength: 3,
    },
    tc: {
        type: String,
        maxlength: 1,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    areaId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'areas',
        required: true 
    }
});

LocationSchema.virtual('area', {
    ref: 'areas',
    localField: 'areaId',
    foreignField: '_id',
    justOne: true
});

LocationSchema.virtual('transactions', {
    ref: 'transactions',
    localField: '_id',
    foreignField: 'locationId',
    justOne: false
});

LocationSchema.set('toJSON', { virtuals: true });

LocationSchema.post('findOneAndDelete', function(doc, next) {
    const locationId = doc._id;
    findTransactions(locationId).then( () => {
        findPickItems(locationId).then( () => {
            findHeatLocs(locationId).then( () => next());
        });
    }); 
});

function findHeatLocs(locationId) {
    return new Promise(function (resolve) {
        if (!locationId) {
            resolve();
        } else {
            HeatLoc.find({ locationId: locationId }, function (err, heatlocs) {
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

function findPickItems(locationId) {
    return new Promise(function (resolve) {
        if (!locationId) {
            resolve();
        } else {
            PickItem.find({ locationId: locationId }, function (err, pickitems) {
                if (err || _.isEmpty(pickitems)) {
                    resolve();
                } else {
                    let myPromises = [];
                    pickitems.map(pickitem => myPromises.push(deletePickItem(pickitem._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePickItem(pickitemId) {
    return new Promise(function(resolve) {
        if (!pickitemId) {
            resolve();
        } else {
            PickItem.findByIdAndDelete(pickitemId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findTransactions(locationId) {
    return new Promise(function (resolve) {
        if (!locationId) {
            resolve();
        } else {
            Transaction.find({ locationId: locationId }, function (err, transactions) {
                if (err || _.isEmpty(transactions)) {
                    resolve();
                } else {
                    let myPromises = [];
                    transactions.map(transaction => myPromises.push(deleteTransaction(transaction._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteTransaction(transactionId) {
    return new Promise(function(resolve) {
        if (!transactionId) {
            resolve();
        } else {
            Transaction.findByIdAndDelete(transactionId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Location = mongoose.model('locations', LocationSchema);

