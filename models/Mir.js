const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MirItem = require('./MirItem');
const PickTicket = require('./PickTicket');
const _ = require('lodash');

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
    
    console.log('self.mir:', self.mir);
    console.log('self.projectId.mir:', self.projectId.mir);

    mongoose.model('mirs', MirSchema).findOne({ mir: self.mir, projectId: self.projectId }, function (err, mir) {
        if (!err && !!mir) {
            self.invalidate("Mir", "MIR should be unique");
            next({ message: 'MIR should be unique' });
        } else {
            next();
        }
    });
});

MirSchema.post('findOneAndDelete', function(doc, next) {
    const mirId = doc._id
    findMirItems(mirId).then( () => {
        findPickTickets(mirId).then( () => next());
    });
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

function deleteMirItem(miritemId) {
    return new Promise(function(resolve) {
        if (!miritemId) {
            resolve();
        } else {
            MirItem.findByIdAndDelete(miritemId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findPickTickets(mirId) {
    return new Promise(function (resolve) {
        if (!mirId) {
            resolve();
        } else {
            PickTicket.find({ mirId: mirId }, function (err, picktickets) {
                if (err || _.isEmpty(picktickets)) {
                    resolve();
                } else {
                    let myPromises = [];
                    picktickets.map(pickticket => myPromises.push(deletePickTicket(pickticket._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePickTicket(pickticketId) {
    return new Promise(function(resolve) {
        if (!pickticketId) {
            resolve();
        } else {
            PickTicket.findByIdAndDelete(pickticketId, function (err) {
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