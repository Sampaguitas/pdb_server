const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Po = require('./Po');
const PackItem = require('./PackItem');
const Heat = require('./Heat');
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

SubSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "subId",
    justOne: false
});

SubSchema.virtual("heats", {
    ref: "heats",
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

SubSchema.pre('findOneAndUpdate', async function() {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!!docToUpdate && this._update.hasOwnProperty('$set') && this._update['$set'].hasOwnProperty('inspRelDate') && !!this._update['$set'].inspRelDate) {
        if (!_.isUndefined(docToUpdate) && !docToUpdate.inspRelDate && !docToUpdate.relQty && !!docToUpdate.rfiQty) {
            this._update['$set'].relQty = docToUpdate.rfiQty;
        }
    }
});

SubSchema.post('findOneAndDelete', function(doc, next) {
    // doc.populate([{path: 'packitems'}, {path: 'po', populate: {path: 'subs'}}], function(err, res) {
        doc.populate({path: 'po', populate: {path: 'subs'}}, function(err, res) {
            if (err) {
                next();
            } else {

                if (_.isEmpty(res.po.subs)) {
                    Po.findByIdAndDelete(res.poId);
                }
                
                findPackitems(doc._id).then( () => findHeats(doc._id).then( () => next())); 
            }
        
        // if (!err && !_.isEmpty(res.packitems)) {
        //     let packitemIds = res.packitems.reduce(function(acc, cur) {
        //         acc.push(cur._id)
        //         return acc;
        //     },[]);
        //     packitemIds.map(packitemId=> PackItem.findByIdAndDelete(packitemId));
        // }

    });
    // next();
});

function findPackitems(subId) {
    return new Promise(function (resolve) {
        if (!subId) {
            resolve();
        } else {
            PackItem.find({ subId: subId }, function (err, packitems) {
                if (err || _.isEmpty(packitems)) {
                    resolve();
                } else {
                    let myPromises = [];
                    packitems.map(packitem => myPromises.push(deletePackitem(packitem._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePackitem(packitemId) {
    return new Promise(function(resolve) {
        if (!packitemId) {
            resolve();
        } else {
            PackItem.findByIdAndDelete(packitemId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findHeats(subId) {
    return new Promise(function (resolve) {
        if (!subId) {
            resolve();
        } else {
            Heat.find({ subId: subId }, function (err, heats) {
                if (err || _.isEmpty(heats)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heats.map(heat => myPromises.push(deleteHeat(heat._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeat(heatId) {
    return new Promise(function(resolve) {
        if (!heatId) {
            resolve();
        } else {
            Heat.findByIdAndDelete(heatId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Sub = mongoose.model('subs', SubSchema);