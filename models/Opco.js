const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const OpcoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    city: {
        type: String,
    },
    zip: {
        type: String
    },
    country: {
        type: String
    },
    phone: {
        type: String
    },
    fax: {
        type: String
    },
    email: {
        type: String
    },
    projectAdmins: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

OpcoSchema.virtual("projects", {
    ref: "projects",
    localField: "_id",
    foreignField: "opco",
    justOne: false
});

OpcoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('opcos', OpcoSchema);
//module.exports= User = mongoose.model('users', UserSchema);
