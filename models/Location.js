const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const LocationSchema = new Schema({
    area: {
        type: Number,
        maxlength: 1,
        required: true
    },
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
        required: true
    },
    tc: {
        type: String,
        maxlength: 1,
        //tube or component
    },
    type: {
        type: Number
        //pallet, shelf, block...
    },
    warehouseId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'warehouses' 
    }
});

LocationSchema.virtual('name').get(function() {

    if (!!this.height) {
        return this.area + '/' + this.hall + this.row + '-' + leadingChar(this.col, '0', 3) + '-' + this.height;
    } else {
        return this.area + '/' + this.hall + this.row + '-' + leadingChar(this.col, '0', 3);
    }
});

LocationSchema.virtual('warehouse', {
    ref: 'warehouses',
    localField: 'warehouseId',
    foreignField: '_id',
    justOne: false
});

LocationSchema.set('toJson', { virtuals: true });

// { timestamps: true}

module.exports = Location = mongoose.model('locations', LocationSchema);

function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
}