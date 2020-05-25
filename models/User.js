const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Access = require('./Access');
const Setting = require('./Setting');
const _ = require('lodash');

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
    isSuperAdmin: {
        type: Boolean,
        default: false  
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos'
    },
    daveId: {
        type: Number,
    }
});

UserSchema.virtual("opco", {
    ref: "opcos",
    localField: "opcoId",
    foreignField: "_id",
    justOne: true
});

UserSchema.set('toJSON', { virtuals: true });

UserSchema.post('findOneAndDelete', function(doc, next) {
    findAccesses(doc._id).then( () => {
        findSettings(doc._id).then( () => {
            next();
        });
    });
});

function findAccesses(userId) {
    return new Promise(function (resolve) {
        if (!userId) {
            resolve();
        } else {
            Access.find({ userId: userId }, function (err, accesses) {
                if (err || _.isEmpty(accesses)) {
                    resolve();
                } else {
                    let myPromises = [];
                    accesses.map(access => myPromises.push(deleteAccess(access._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteAccess(accessId) {
    return new Promise(function(resolve) {
        if (!accessId) {
            resolve();
        } else {
            Access.findOneAndDelete({_id : accessId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findSettings(userId) {
    return new Promise(function (resolve) {
        if (!userId) {
            resolve();
        } else {
            Setting.find({ userId: userId }, function (err, settings) {
                if (err || _.isEmpty(settings)) {
                    resolve();
                } else {
                    let myPromises = [];
                    settings.map(setting => myPromises.push(deleteSetting(setting._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteSetting(settingId) {
    return new Promise(function(resolve) {
        if (!settingId) {
            resolve();
        } else {
            Setting.findOneAndDelete({_id : settingId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);


