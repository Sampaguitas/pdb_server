const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSettingSchema = new Schema({
    screen: {
        type: String,
        required: true
    },
    selectSettings: {
        type: String,
    },
    showSettings: {
        type: String,
    },
    gridSettings: {
        type: String,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'   
    },
    daveId: {
        type: Number,
    }
});

//module.exports = mongoose.model('users', UserSchema);
module.exports= UserSetting = mongoose.model('usersettings', UserSettingSchema);


