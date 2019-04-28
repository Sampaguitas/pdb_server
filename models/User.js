const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    name: {
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
    opco: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos'
    }
});

//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);


