const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
    date: {
        type: Date,
        default: Date.now
    }
});



//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);
