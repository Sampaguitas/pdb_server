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
    projectAdmins: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    }],
    daveId: {
        type: Number,
    }
});

// OpcoSchema.virtual("projects", {
//     ref: "projects",
//     localField: "_id",
//     foreignField: "opco",
//     justOne: false
// });

// CurrencySchema.virtual('name').get(function () {
//     return this.code + ' - ' + this.description
// })

// OpcoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('opcos', OpcoSchema);
//module.exports= User = mongoose.model('users', UserSchema);
