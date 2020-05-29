const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MirItem = require('./MirItem');
const _ = require('lodash');

//Create Schema
const MirSchema = new Schema({
    vlMir: {
        type: Number,
        required: true,
    },
    clMir: {
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

MirSchema.virtual('miritems', {
    ref: 'miritems',
    localField: '_id',
    foreignField: 'mirId',
    justOne: false
});

MirSchema.set('toJSON', { virtuals: true });

MirSchema.pre('save', function(next) {
    let self = this;
    mongoose.model('mirs', MirSchema).find({ projectId: self.projectId }, function (err, mirs) {
        if (err) {
            self.invalidate("vlMir", "Could not retrive previous mirs");
        } else if (_.isEmpty(mirs)) {
            self.vlMir = 1;
        } else {
            let lastVlMir = mirs.reduce(function(acc, cur) {
                if (cur.vlMir > acc) {
                    acc === cur.vlMir;
                }
                return acc;
            }, 1);
            self.vlMir = lastVlMir;
        }
        next();
    });
});

MirSchema.post('findOneAndDelete', function(doc, next) {
    findMirItems(doc._id).then( () => next()); 
});

function findMirItems(mirId) {
    return new Promise(function (resolve) {
        if (!mirId) {
            resolve();
        } else {
            MirItem.find({ mirId: mirId }, function (err, miritems) {
                if (err || _.isEmpty(miritems)) {
                    resolve();
                } else {
                    let myPromises = [];
                    miritems.map(miritem => myPromises.push(deleteMirItem(miritem._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteMirItem(mirId) {
    return new Promise(function(resolve) {
        if (!mirId) {
            resolve();
        } else {
            MirItem.findOneAndDelete({_id : mirId}, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Mir = mongoose.model('mirs', MirSchema);