const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mir = require('./Mir');
const _ = require('lodash');

//Create Schema
const CallOffSchema = new Schema({
    mirNr: {
        type: Number,
        required: true,
    },
    clCallOff: {
        type: String,
        required: false,
    },
    dateReceived: {
        type: Date,
        required: true,
    },
    dateExpected: {
        type: Date,
        required: true,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true,
    }
});

CallOffSchema.virtual('mirs', {
    ref: 'mirs',
    localField: '_id',
    foreignField: 'calloffId',
    justOne: false
});

CallOffSchema.set('toJSON', { virtuals: true });

CallOffSchema.pre('save', function(next) {
    let self = this;
    mongoose.model('calloffs', CallOffSchema).find({ projectId: self.projectId }, function (err, calloffs) {
        if (err) {
            self.invalidate("mirNr", "Could not retrive previous calloffs");
        } else if (_.isEmpty(calloffs)) {
            self.mirNr = 1;
        } else {
            let lastMirNr = calloffs.reduce(function(acc, cur) {
                if (cur.mirNr > acc) {
                    acc === cur.nirNr;
                }
                return acc;
            }, 1);
            self.mirNr = lastMirNr;
        }
        next();
    });
});

CallOffSchema.post('findOneAndDelete', function(doc, next) {
    findMirs(doc._id).then( () => next()); 
});

function findMirs(calloffId) {
    return new Promise(function (resolve) {
        if (!calloffId) {
            resolve();
        } else {
            Mir.find({ calloffId: calloffId }, function (err, calloffs) {
                if (err || _.isEmpty(calloffs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    calloffs.map(calloff => myPromises.push(deleteMir(calloff._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteMir(calloffId) {
    return new Promise(function(resolve) {
        if (!calloffId) {
            resolve();
        } else {
            Mir.findOneAndDelete({_id : calloffId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = CallOff = mongoose.model('calloffs', CallOffSchema);