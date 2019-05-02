const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const OpcoSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    zip: {
        type: String,
    },
    country: {
        type: String,
    },
    daveId: {
        type: Number,
    }
});

OpcoSchema.virtual("projects", {
    ref: "projects",
    localField: "_id",
    foreignField: "opcoId",
    justOne: false
});



OpcoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('opcos', OpcoSchema);
//module.exports= User = mongoose.model('users', UserSchema);

// CurrencySchema.virtual('name').get(function () {
//     return this.code + ' - ' + this.description
// })
