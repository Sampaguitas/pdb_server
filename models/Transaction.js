const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    // nfi: {
    //     type: String
    // },
    // plNr: {
    //     type: Number,
    // },
    // colliNr: {
    //     type: String,
    // },
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
    }
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

module.exports = Transaction = mongoose.model('transactions', TransactionSchema);