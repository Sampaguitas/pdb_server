const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Location = require('./Location');
const _ = require('lodash');

const AreaSchema = new Schema({
    areaNr: {
        type: Number,
        maxlength: 1,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    warehouseId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'warehouses',
        required: true
    }
});

AreaSchema.virtual('warehouse', {
    ref: 'warehouses',
    localField: 'warehouseId',
    foreignField: '_id',
    justOne: true
});

AreaSchema.virtual('locations', {
    ref: 'locations',
    localField: '_id',
    foreignField: 'areaId',
    justOne: false
});

AreaSchema.set('toJSON', { virtuals: true });

AreaSchema.post('findOneAndDelete', function(doc, next) {
    findLocations(doc._id).then( () => next()); 
});

function findLocations(areaId) {
    return new Promise(function (resolve) {
        if (!areaId) {
            resolve();
        } else {
            Location.find({ areaId: areaId }, function (err, locations) {
                if (err || _.isEmpty(locations)) {
                    resolve();
                } else {
                    let myPromises = [];
                    locations.map(location => myPromises.push(deleteLocation(location._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteLocation(locationId) {
    return new Promise(function(resolve) {
        if (!locationId) {
            resolve();
        } else {
            Location.findOneAndDelete({_id : locationId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Area = mongoose.model('areas', AreaSchema);

