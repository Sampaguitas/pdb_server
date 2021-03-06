const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Area = require('./Area');
const PickTicket = require('./PickTicket');
const _ = require('lodash');

//Create Schema
const WarehouseSchema = new Schema({
    warehouse: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true,
    }

});

// { timestamps: true}

WarehouseSchema.virtual('areas', {
    ref: 'areas',
    localField: '_id',
    foreignField: 'warehouseId',
    justOne: false
});

WarehouseSchema.set('toJSON', { virtuals: true });

WarehouseSchema.post('findOneAndDelete', function(doc, next) {
    const warehouseId = doc._id;
    findAreas(warehouseId).then( () => {
        findPickTickets(warehouseId).then( () => next());
    }); 
});

function findAreas(warehouseId) {
    return new Promise(function (resolve) {
        if (!warehouseId) {
            resolve();
        } else {
            Area.find({ warehouseId: warehouseId }, function (err, areas) {
                if (err || _.isEmpty(areas)) {
                    resolve();
                } else {
                    let myPromises = [];
                    areas.map(area => myPromises.push(deleteArea(area._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteArea(areaId) {
    return new Promise(function(resolve) {
        if (!areaId) {
            resolve();
        } else {
            Area.findByIdAndDelete(areaId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findPickTickets(warehouseId) {
    return new Promise(function (resolve) {
        if (!warehouseId) {
            resolve();
        } else {
            PickTicket.find({ warehouseId: warehouseId }, function (err, picktickets) {
                if (err || _.isEmpty(picktickets)) {
                    resolve();
                } else {
                    let myPromises = [];
                    picktickets.map(pickticket => myPromises.push(deletePickTicket(pickticket._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePickTicket(pickticketId) {
    return new Promise(function(resolve) {
        if (!pickticketId) {
            resolve();
        } else {
            PickTicket.findByIdAndDelete(pickticketId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Warehouse = mongoose.model('warehouses', WarehouseSchema);