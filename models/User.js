const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});



//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);


// roles: {
//     admin: {
//         type: Boolean,
//             default: false
//     },
//     superUser: {
//         type: Boolean,
//             default: false
//     },
//     expediter: {
//         type: Boolean,
//             default: false
//     },
//     inspector: {
//         type: Boolean,
//             default: false
//     },
//     shipper: {
//         type: Boolean,
//             default: false
//     },
//     warehouse: {
//         type: Boolean,
//             default: false
//     }