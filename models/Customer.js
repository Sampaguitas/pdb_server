const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const CustomerSchema = new Schema({
    code: {
        type: String,
        required: true
    },
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
    invoiceName: {
        type: String,
    },
    invoiceAddress: {
        type: String
    },
    invoiceCity: {
        type: String,
    },
    invoiceZip: {
        type: String
    },
    invoiceCountry: {
        type: String
    },
    invoicePhone: {
        type: String
    },
    invoiceFax: {
        type: String
    },
    invoiceEmail: {
        type: String
    },
    vat_no: {
        type: String
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('customers', CustomerSchema);
//module.exports= User = mongoose.model('users', UserSchema);
