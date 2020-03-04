const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ColliPack = require('./ColliPack');
const _ = require('lodash');

//Create Schema
const PackItemSchema = new Schema({
    plNr: {
        type: Number,
    },
    colliNr: {
        type: String,
    },
    mtrs: {
        type: Number,
    },
    pcs: {
        type: Number,
    },
    mmt: {
        type: String,
    },
    mmtDate: {
        type: Date,
    },
    plDate: {
        type: Date,
    },
    invTaxNr: {
        type: String,
    },
    invTaxDate: {
        type: Date,
    },
    invCustNr: {
        type: String,
    },
    invCustDate: {
        type: Date,
    },
    udfPiX1: {
        type: String,
    },
    udfPiX2: {
        type: String,
    },
    udfPiX3: {
        type: String,
    },
    udfPiX4: {
        type: String,
    },
    udfPiX5: {
        type: String,
    },
    udfPiX6: {
        type: String,
    },
    udfPiX7: {
        type: String,
    },
    udfPiX8: {
        type: String,
    },
    udfPiX9: {
        type: String,
    },
    udfPiX10: {
        type: String,
    },
    udfPi91: {
        type: Number,
    },
    udfPi92: {
        type: Number,
    },
    udfPi93: {
        type: Number,
    },
    udfPi94: {
        type: Number,
    },
    udfPi95: {
        type: Number,
    },
    udfPi96: {
        type: Number,
    },
    udfPi97: {
        type: Number,
    },
    udfPi98: {
        type: Number,
    },
    udfPi99: {
        type: Number,
    },
    udfPi910: {
        type: Number,
    },
    udfPiD1: {
        type: Date,
    },
    udfPiD2: {
        type: Date,
    },
    udfPiD3: {
        type: Date,
    },
    udfPiD4: {
        type: Date,
    },
    udfPiD5: {
        type: Date,
    },
    udfPiD6: {
        type: Date,
    },
    udfPiD7: {
        type: Date,
    },
    udfPiD8: {
        type: Date,
    },
    udfPiD9: {
        type: Date,
    },
    udfPiD10: {
        type: Date,
    },
    subId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'subs'  
    },
    packId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'collipacks'  
    },
    daveId: {
        type: Number,
    }
});

PackItemSchema.virtual("sub", {
    ref: "subs",
    localField: "subId",
    foreignField: "_id",
    justOne: true
});

PackItemSchema.set('toJSON', { virtuals: true });

PackItemSchema.post('findOneAndUpdate', function(doc, next) {
    doc.populate({ path: 'sub', populate: { path: 'po' } }, function(err, res) {
        if (!err && !!res.sub.po.projectId) {
            let projectId = res.sub.po.projectId;
            //if new packitem has plNr and colliNr:
            if (!!res.plNr && !!res.colliNr) {
                let filter = { plNr: res.plNr, colliNr: res.colliNr, projectId: projectId };
                let update = { plNr: res.plNr, colliNr: res.colliNr, projectId: projectId };
                let options = { new: true, upsert: true };
                 //we whant to create a colli in the collipack collection (if it does not already exist);
                ColliPack.findOneAndUpdate(filter, update, options, function(errColliPack, resColliPack) {
                    if (!errColliPack && !!resColliPack._id) {
                        //if that packitem already had a packId (different than the colli id):
                        if (!_.isUndefined(res.packId) && res.packId != resColliPack._id) {
                            let tempId = res.packId;
                            //we look how many documents have the that old packId
                            PackItem.countDocuments({ packId: res.packId, _id: { $ne: res._id } }, function(err, count) {
                                //if no other documents had that packid (except this document):
                                if (count === 0) {
                                    //delete that colli from the collipack collection.
                                    ColliPack.findByIdAndDelete(tempId, function () {
                                        //then assign that colli id to our packitem and save
                                        doc.packId = resColliPack._id;
                                        doc.save();
                                    });
                                } else {
                                    //else assign that colli id to our packitem and save
                                    doc.packId = resColliPack._id;
                                    doc.save();
                                }
                            });
                        } else {
                            //else assign that colli id to our packitem and save
                            doc.packId = resColliPack._id;
                            doc.save();
                        } 
                    }
                });
            //if new packitem does not have both plNr & colliNr but already have a packid:
            } else if (res.packId) {
                // //count how many documents have had the same packid in the collection.
                let tempId = res.packId;
                PackItem.countDocuments({ packId: doc.packId, _id: { $ne: res._id } }, function (err, count) {
                    //if no other documents had that packid (except this document):
                    if (count === 0) {
                        //delete that colli from the collipack collection.
                        ColliPack.findByIdAndDelete(tempId, function () {
                            //then remove the link to that old colli
                            doc.packId = undefined;
                            doc.save();
                        });
                    } else {
                        //else remove the link to that old colli
                        doc.packId = undefined;
                        doc.save();
                    } 
                });
            }
        }
    });
    next();
});

module.exports = PackItem = mongoose.model('packitems', PackItemSchema);