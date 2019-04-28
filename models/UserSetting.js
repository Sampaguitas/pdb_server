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
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'   
    }
});

//module.exports = mongoose.model('users', UserSchema);
module.exports= UserSetting = mongoose.model('usersettings', UserSettingSchema);


