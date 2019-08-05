const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ResetPasswordSchema = new Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    },
    token: {
        type: String,
    },
    expire:{
        type: Date,
    },
    status:{
        type: Number,
        default: 0,
    }
});

module.exports= ResetPassword = mongoose.model('resetpasswords', ResetPasswordSchema);


