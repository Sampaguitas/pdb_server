const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PackItem = require('./PackItem');
const Po = require('./Po');
const _ = require('lodash');

//Create Schema
const SubSchema = new Schema({
    vlDelDateExp: {
        type: Date,
    },
    vlDelDateAct: {
        type: Date,
    },
    supReadyDateExp: {
        type: Date,
    },
    supReadyDateAct: {
        type: Date,
    },
    supDelDateExp: {
        type: Date,
    },
    supDelDateAct: {
        type: Date,
    },
    nfiDateExp: {
        type: Date,
    },
    nfiDateAct:{
        type: Date, 
    },
    rfiDateExp: {
        type: Date,
    },
    rfiDateAct: {
        type: Date,
    },
    inspRelDate: {
        type: Date,
    },
    rfsDateExp: {
        type: Date,
    },
    rfsDateAct: {
        type: Date,
    },
    shipDateExp: {
        type: Date,
    },
    shipDateAct: {
        type: Date,
    },
    shipDocSent: {
        type: Date,
    },
    etaDate: {
        type: Date,
    },
    rfiQty:{
        type: Number,
    },
    rfiQtyOrg: {
        type: Number, 
    },
    inspQty:{
        type: Number,
    },
    inspQtyOrg: {
        type: Number,  
    },
    relQty: {
        type: Number,
    },
    shippedQty: {
        type: Number,
    },
    splitQty: {
        type: Number,
    },
    nfi: {
        type: Number,
    },
    heatNr: {
        type: String,
    },
    manufacturer: {
        type: String,
    },
    manufOrigin: {
        type: String,
    },
    inspector: {
        type: String,
    },
    delivery: {
        type: String,
    },
    deliveryPos: {
        type: Number,
    },
    transport: {
        type: String,
    },
    transportPos: {
        type: Number,
    },
    destination: {
        type: String,
    },
    commentsExp: {
        type: String,
    },
    commentsInsp: {
        type: String,
    },
    commentsLog: {
        type: String,
    },
    intComments: {
        type: String,
    },
    udfSbX1: {
        type: String,
    },
    udfSbX2: {
        type: String,
    },
    udfSbX3: {
        type: String,
    },
    udfSbX4: {
        type: String,
    },
    udfSbX5: {
        type: String,
    },
    udfSbX6: {
        type: String,
    },
    udfSbX7: {
        type: String,
    },
    udfSbX8: {
        type: String,
    },
    udfSbX9: {
        type: String,
    },
    udfSbX10: {
        type: String,
    },
    udfSb91: {
        type: Number,
    },
    udfSb92: {
        type: Number,
    },
    udfSb93: {
        type: Number,
    },
    udfSb94: {
        type: Number,
    },
    udfSb95: {
        type: Number,
    },
    udfSb96: {
        type: Number,
    },
    udfSb97: {
        type: Number,
    },
    udfSb98: {
        type: Number,
    },
    udfSb99: {
        type: Number,
    },
    udfSb910: {
        type: Number,
    },
    udfSbD1: {
        type: Date,
    },
    udfSbD2: {
        type: Date,
    },
    udfSbD3: {
        type: Date,
    },
    udfSbD4: {
        type: Date,
    },
    udfSbD5: {
        type: Date,
    },
    udfSbD6: {
        type: Date,
    },
    udfSbD7: {
        type: Date,
    },
    udfSbD8: {
        type: Date,
    },
    udfSbD9: {
        type: Date,
    },
    udfSbD10: {
        type: Date,
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos' 
    },
    daveId: {
        type: Number,
    }
});

SubSchema.virtual("certificates", {
    ref: "certificates",
    localField: "_id",
    foreignField: "subId",
    justOne: false
});

SubSchema.virtual("packitems", {
    ref: "packitems",
    localField: "_id",
    foreignField: "subId",
    justOne: false
});

SubSchema.virtual("po", {
    ref: "pos",
    localField: "poId",
    foreignField: "_id",
    justOne: true
});

SubSchema.set('toJSON', { virtuals: true });


SubSchema.post('findOneAndDelete', function(doc, next) {
    doc.populate([{path: 'packitems'}, {path: 'po', populate: {path: 'subs'}}], function(err, res) {
        
        if (!err && !_.isEmpty(res.packitems)) {
            let packItemIds = res.packitems.reduce(function(acc, cur) {
                acc.push(cur._id)
                return acc;
            },[]);
            packItemIds.map(packItemId=> PackItem.findOneAndDelete({ _id: packItemId}));
        }

        if (_.isEmpty(res.po.subs)) {
            Po.findOneAndDelete({ _id: res.poId });
        }
        
    });
    next();
});

module.exports = Sub = mongoose.model('subs', SubSchema);