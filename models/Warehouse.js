const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const WarehouseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects' 
    }

});

// { timestamps: true}

WarehouseSchema.virtual('locations', {
    ref: 'locations',
    localField: '_id',
    foreignField: 'warehouseId',
    justOne: false
});

WarehouseSchema.set('toJson', { virtuals: true });

module.exports = Warehouse = mongoose.model('warehouses', WarehouseSchema);