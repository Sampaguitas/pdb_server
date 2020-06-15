const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WhColliPack = require('./WhColliPack');
const Po = require('./Po');
const _ = require('lodash');

//Create Schema
const WhPackItemSchema = new Schema({
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
    pickitemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pickitems'  
    },
    whcollipackId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'whcollipacks'  
    },
    daveId: {
        type: Number,
    }
});

WhPackItemSchema.virtual("pickitem", {
    ref: "pickitems",
    localField: "pickitemId",
    foreignField: "_id",
    justOne: true
});

WhPackItemSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "whpackitemId",
    justOne: false
});

WhPackItemSchema.set('toJSON', { virtuals: true });


WhPackItemSchema.post('findOneAndDelete', function(doc, next) {
    doc.populate({ path: 'pickitem', populate: { path: 'po' } }, function(err, res) {
        if (!err && !!res.pickitem.po.projectId) {
            let projectId = res.pickitem.po.projectId;
            removeDirtyCollis(projectId);
        }
    });
    next();
});


WhPackItemSchema.post('findOneAndUpdate', function(doc, next) {
    doc.populate({ path: 'pickitem', populate: { path: 'po' } }, function(err, res) {
        if (!err && !!res.pickitem.po.projectId) {
            let projectId = res.pickitem.po.projectId;
            removeDirtyCollis(projectId).then( () => {
                //if new whpackitem has plNr and colliNr:
                if (!!res.plNr && !!res.colliNr) {
                    let filter = { plNr: res.plNr, colliNr: res.colliNr, projectId: projectId };
                    let update = { plNr: res.plNr, colliNr: res.colliNr, projectId: projectId };
                    let options = { new: true, upsert: true };
                    //we whant to create a colli in the whcollipack collection (if it does not already exist);
                    WhColliPack.findOneAndUpdate(filter, update, options, function(errWhColliPack, resWhColliPack) {
                        if (!errWhColliPack && !!resWhColliPack._id) {
                            // removeDirtyCollis(projectId).then(onfulfilled => {
                                doc.whcollipackId = resWhColliPack._id;
                                doc.save();
                            // });
                        } else {
                            doc.whcollipackId = undefined;
                            doc.save();
                        }
                    });
                } else {
                    doc.whcollipackId = undefined;
                    doc.save();
                }
            });
        }
    });
    next();
});


function removeDirtyCollis(projectId) {
    return new Promise(function (resolve, reject) {
        Po
        .find({projectId: projectId})
        .populate({
            path: 'pickitems',
            populate: {
                path: 'whpackitems'
            }
        })
        .exec(function(errPo, resPos) {
            if (errPo) {
                resolve ({
                    isRejected: true,
                    message: 'Could not retrive pos.'
                });
            } else if (_.isEmpty(resPos)) {
                resolve ({
                    isRejected: true,
                    message: 'Po seems to be empty.'
                });
            } else {

                let projectCollis = resPos.reduce(function (accPo, curPo) {
                    let tempSubs = curPo.pickitems.reduce(function (accSub, curSub) {
                        let temWhPackItems = curSub.whpackitems.reduce(function (accWhPackItem, curWhPackItem) {
                            if(!!curWhPackItem.plNr && !!curWhPackItem.colliNr && !doesHave(accWhPackItem, curWhPackItem.plNr, curWhPackItem.colliNr)) {
                                accWhPackItem.push({plNr: curWhPackItem.plNr, colliNr: curWhPackItem.colliNr});
                            }
                            return accWhPackItem;
                        }, []);
                        temWhPackItems.map(temWhPackItem => {
                            if(!doesHave(accSub, temWhPackItem.plNr, temWhPackItem.colliNr)) {
                                accSub.push({
                                    plNr: temWhPackItem.plNr, 
                                    colliNr: temWhPackItem.colliNr
                                });
                            }
                        });
    
                        return accSub;
                    }, []);
                    tempSubs.map(tempSub => {
                        if(!doesHave(accPo, tempSub.plNr, tempSub.colliNr)) {
                            accPo.push({
                                plNr: tempSub.plNr, 
                                colliNr: tempSub.colliNr
                            });
                        }
                    });
    
                    return accPo;
                }, []);

                if (projectCollis) {
                    WhColliPack.find({projectId: projectId}, function (err, whcollipacks) {
                        if (err) {
                            resolve({
                                isRejected: true,
                                message: 'an error occured while trying to retrive WhColliPacks.' 
                            });
                        } else if (_.isEmpty(whcollipacks)) {
                            resolve({
                                isRejected: false,
                                message: 'No WhColliPacks.' 
                            });
                        } else {
                            let tempPackIds = [];
                            whcollipacks.map(whcollipack => {
                                if (!doesHave(projectCollis, whcollipack.plNr, whcollipack.colliNr)) {
                                    tempPackIds.push(whcollipack._id);
                                }
                            });
                            if (_.isEmpty(tempPackIds)) {
                                resolve({
                                    isRejected: false,
                                    message: 'No WhColliPacks are different than whpackitems.' 
                                }); 
                            } else {
                                WhColliPack.deleteMany({_id: { $in: tempPackIds } }, function (err) {
                                    if (err) {
                                        resolve({
                                            isRejected: true,
                                            message: 'An error has occured while removing WhColliPacks.' 
                                        });
                                    } else {
                                        resolve({
                                            isRejected: false,
                                            message: 'All whcollipacks have been removed.' 
                                        });
                                    }
                                });
                            }
                        }
                    });
                } else {
                    resolve({
                        isRejected: false,
                        message: 'no whpackitem colli(s) to be deleted.'
                    })
                }
            }
        });
    });
}

function doesHave(array, plNr, colliNr) {
    return !!array.find(e => e.plNr == plNr && e.colliNr == colliNr);
}

module.exports = WhPackItem = mongoose.model('whpackitems', WhPackItemSchema);