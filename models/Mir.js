const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MirItem = require('./MirItem');
const _ = require('lodash');

//Create Schema
const MirSchema = new Schema({
    mir: {
        type: String,
        required: true,
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
    mongoose.model('mirs', MirSchema).findOne({ mir: self.mir, projectId: self.projectId }, function (err, mir) {
        if (!err && !!mir) {
            self.invalidate("Mir", "MIR should be unique");
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
            MirItem.findByIdAndDelete(mirId, function (err) {
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