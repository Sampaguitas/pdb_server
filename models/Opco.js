const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const OpcoSchema = new Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
    },    
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
    localeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locales',
        required: true
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

OpcoSchema.virtual("locale", {
    ref: "locales",
    localField: "localeId",
    foreignField: "_id",
    justOne: false
});

OpcoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('opcos', OpcoSchema);
//module.exports= User = mongoose.model('users', UserSchema);

// CurrencySchema.virtual('name').get(function () {
//     return this.code + ' - ' + this.description
// })
