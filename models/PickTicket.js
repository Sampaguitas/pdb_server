const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PickItem = require('./PickItem')
const _ = require('lodash');

const PickTicketSchema = new Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    pickNr: {
        type: Number 
    },
    isProcessed: {
        type: Boolean,
        default: false,
    },
    mirId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'mirs',
        required: true, 
    },
    warehouseId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'warehouses',
        required: true  
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true
    },
});

PickTicketSchema.virtual("pickitems", {
    ref: "pickitems",
    localField: "_id",
    foreignField: "pickticketId",
    justOne: false
});

PickTicketSchema.virtual("mir", {
    ref: "mirs",
    localField: "mirId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.virtual("warehouse", {
    ref: "warehouses",
    localField: "warehouseId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.virtual("project", {
    ref: "projects",
    localField: "projectId",
    foreignField: "_id",
    justOne: true
});

PickTicketSchema.set('toJSON', { virtuals: true });

PickTicketSchema.pre('save', function(next) {
    let self = this;
    mongoose.model('picktickets', PickTicketSchema).find({ mirId: self.mirId }, function (err, picktickets) {
        if (err) {
            self.invalidate("pickNr", "pickNr is required.");
            next({ message: 'Could not generate the pickNr.' });
        } else if (_.isEmpty(picktickets)) {
            self.pickNr = 1;
            next();
        } else {
            let lastPickNr = picktickets.reduce(function (acc, cur) {
                if (cur.pickNr > acc) {
                    acc = cur.pickNr;
                }
                return acc;
            }, 0);
            self.pickNr = lastPickNr + 1;
            next();
        }
    });
});

PickTicketSchema.post('findOneAndDelete', function(doc, next) {
    findPickItems(doc._id).then( () => next()); 
});

function findPickItems(pickticketId) {
    return new Promise(function (resolve) {
        if (!pickticketId) {
            resolve();
        } else {
            PickItem.find({ pickticketId: pickticketId }, function (err, pickitems) {
                if (err || _.isEmpty(pickitems)) {
                    resolve();
                } else {
                    let myPromises = [];
                    pickitems.map(pickitem => myPromises.push(deletePickItem(pickitem._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePickItem(pickitemId) {
    return new Promise(function(resolve) {
        if (!pickitemId) {
            resolve();
        } else {
            PickItem.findByIdAndDelete(pickitemId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = PickTicket = mongoose.model('picktickets', PickTicketSchema);