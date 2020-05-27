const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

//Create Schema
const TransactionSchema = new Schema({  
    transQty: {
        type: Number,
    },
    transDate: {
        type: Date,
    },
    transType: {
        type: String,
        required: true,
    },
    transComment: {
        type: String,
        required: true,
    },
    locationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locations',
        required: true 
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos',
        required: true
    },
    subId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'subs',
    },
    packitemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'packitems',
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true 
    },
    transferId: {
        type: mongoose.SchemaTypes.ObjectId
    }
}, {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

TransactionSchema.virtual("location", {
    ref: "locations",
    localField: "locationId",
    foreignField: "_id",
    justOne: true
});

TransactionSchema.virtual("po", {
    ref: "pos",
    localField: "poId",
    foreignField: "_id",
    justOne: true
});

TransactionSchema.virtual("sub", {
    ref: "subs",
    localField: "subId",
    foreignField: "_id",
    justOne: true
});

TransactionSchema.virtual("packitem", {
    ref: "packitems",
    localField: "packitemId",
    foreignField: "_id",
    justOne: true
});

TransactionSchema.virtual("project", {
    ref: "projects",
    localField: "ProjectId",
    foreignField: "_id",
    justOne: true
});

TransactionSchema.set('toJSON', { virtuals: true });

TransactionSchema.post('findOneAndDelete', function(doc, next) {
    transferId = doc.transferId;
    if (!_.isUndefined(transferId) && !!transferId) {
        findSiblings(transferId).then( () => next());
    } else {
        next();
    }
});

function findSiblings(transferId) {
    let myPromises = [];
    return new Promise(function(resolve) {
        mongoose.model('transactions', TransactionSchema).find({ transferId: transferId}, function(err, siblings) {
            if(err || _.isEmpty(siblings)) {
                resolve();
            } else {
                console.log('siblings:', siblings);
                siblings.map(sibling => myPromises.push(deleteSibling(sibling._id)));
                Promise.all(myPromises).then( () => resolve());
            }
        });
    });
}

function deleteSibling(transactionId) {
    return new Promise(function(resolve) {
        mongoose.model('transactions', TransactionSchema).findByIdAndDelete(transactionId, function(err) {
            if (err) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}

module.exports = Transaction = mongoose.model('transactions', TransactionSchema);

