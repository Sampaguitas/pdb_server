const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = Area = mongoose.model('areas', AreaSchema);

