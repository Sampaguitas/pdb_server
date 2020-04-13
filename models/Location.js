const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        required: true
    },
    tc: {
        type: String,
        maxlength: 1,
        //tube or component
    },
    type: {
        type: String
        //pallet, shelf, block...
    },
    areaId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'areas' 
    }
});

// LocationSchema.virtual('name').get(function() {

//     if (!!this.height) {
//         return this.area + '/' + this.hall + this.row + '-' + leadingChar(this.col, '0', 3) + '-' + this.height;
//     } else {
//         return this.area + '/' + this.hall + this.row + '-' + leadingChar(this.col, '0', 3);
//     }
// });

// function leadingChar(string, char, length) {
//     return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
// }

LocationSchema.virtual('area', {
    ref: 'areas',
    localField: 'areaId',
    foreignField: '_id',
    justOne: true
});

LocationSchema.set('toJson', { virtuals: true });

module.exports = Location = mongoose.model('locations', LocationSchema);

