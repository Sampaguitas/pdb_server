const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ResetPasswordSchema = new Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    },
    resetPasswordToken: {
        type: String,
    },
    expire:{
        type: Date,
    },
    status:{
        type: Boolean,
    }
});

module.exports= ResetPassword = mongoose.model('resetpasswords', ResetPasswordSchema);


