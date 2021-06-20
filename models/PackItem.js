const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ColliPack = require('./ColliPack');
const Po = require('../models/Po');
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
    collipackId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'collipacks'  
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos'
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'
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

PackItemSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "packitemId",
    justOne: false
});

PackItemSchema.set('toJSON', { virtuals: true });


// PackItemSchema.post('findOneAndDelete', function(doc, next) {
//     doc.populate({ path: 'sub', populate: { path: 'po' } }, function(err, res) {
//         if (!err && !!res.sub.po.projectId) {
//             let projectId = res.sub.po.projectId;
//             removeDirtyCollis(projectId);
//         }
//     });
//     next();
// });

PackItemSchema.pre('findOneAndDelete', async function() {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (!!docToDelete) {
        isUnique(docToDelete.collipackId, false).then(res => res.isUnique && mongoose.model('collipacks').findByIdAndDelete(docToDelete.collipackId));
    }
});


PackItemSchema.pre('findOneAndUpdate', async function() {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!!docToUpdate && this._update.hasOwnProperty('$set') && (this._update['$set'].hasOwnProperty('plNr') || this._update['$set'].hasOwnProperty('colliNr'))) {
        isUnique(docToUpdate.collipackId, !!docToUpdate.plNr && !!docToUpdate.colliNr).then(res => res.isUnique && mongoose.model('collipacks').findByIdAndDelete(docToUpdate.collipackId));
        this._update['$set'].collipackId = undefined;
    }
});

PackItemSchema.post('findOneAndUpdate', function(doc, next) {
    doc.populate({ path: 'sub', populate: { path: 'po' } }, function(err, res) {
        if (!err && !!res.sub.po.projectId) {
            let plNr = res.plNr;
            let colliNr = res.colliNr
            let projectId = res.sub.po.projectId;
            // removeDirtyCollis(projectId).then( () => {
                //if new packitem has plNr and colliNr:
                if (!!plNr && !!colliNr) {
                    let filter = { plNr: plNr, colliNr: colliNr, projectId: projectId };
                    let update = { plNr: plNr, colliNr: colliNr, projectId: projectId };
                    let options = { new: true, upsert: true };
                    //we want to create a colli in the collipack collection (if it does not already exist);
                    mongoose.model('collipacks').findOneAndUpdate(filter, update, options, function(errColliPack, resColliPack) {
                        if (!errColliPack && !!resColliPack._id) {
                            // removeDirtyCollis(projectId).then(onfulfilled => {
                                doc.collipackId = resColliPack._id;
                                doc.save();
                            // });
                        } else {
                            doc.collipackId = undefined;
                            doc.save();
                        }
                    });
                } else {
                    doc.collipackId = undefined;
                    doc.save();
                }
            // });
        }
    });
    next();
});

module.exports = PackItem = mongoose.model('packitems', PackItemSchema);

async function isUnique(collipackId, noblank) {
    return new Promise(function(resolve) {
        if (!!collipackId) {
            mongoose.model('collipacks').findById(collipackId)
            .populate('packitems')
            .exec(function(err, res) {
                if (!!err || !res || (res.packitems.length + noblank > 1)) {
                    resolve({isUnique: false});
                } else {
                    resolve({isUnique: true});
                }
            });
        } else {
            resolve({isUnique: false});
        }
    });
}

// function removeDirtyCollis(projectId) {
//     return new Promise(function (resolve) {
//         Po.find({ projectId: projectId })
//         .populate({
//             path: 'subs',
//             populate: {
//                 path: 'packitems'
//             }
//         })
//         .exec(function(errPo, resPos) {
//             if (errPo) {
//                 resolve ({
//                     isRejected: true,
//                     message: 'Could not retrive pos.'
//                 });
//             } else if (_.isEmpty(resPos)) {
//                 resolve ({
//                     isRejected: true,
//                     message: 'Po seems to be empty.'
//                 });
//             } else {
//                 let projectCollis = resPos.reduce(function (accPo, curPo) {
//                     let tempSubs = curPo.subs.reduce(function (accSub, curSub) {
//                         let temPackItems = curSub.packitems.reduce(function (accPackItem, curPackItem) {
//                             if(!!curPackItem.plNr && !!curPackItem.colliNr && !doesHave(accPackItem, curPackItem.plNr, curPackItem.colliNr)) {
//                                 accPackItem.push({plNr: curPackItem.plNr, colliNr: curPackItem.colliNr});
//                             }
//                             return accPackItem;
//                         }, []);
//                         temPackItems.map(temPackItem => {
//                             if(!doesHave(accSub, temPackItem.plNr, temPackItem.colliNr)) {
//                                 accSub.push({
//                                     plNr: temPackItem.plNr, 
//                                     colliNr: temPackItem.colliNr
//                                 });
//                             }
//                         });
    
//                         return accSub;
//                     }, []);
//                     tempSubs.map(tempSub => {
//                         if(!doesHave(accPo, tempSub.plNr, tempSub.colliNr)) {
//                             accPo.push({
//                                 plNr: tempSub.plNr, 
//                                 colliNr: tempSub.colliNr
//                             });
//                         }
//                     });
    
//                     return accPo;
//                 }, []);

//                 if (projectCollis) {
//                     ColliPack.find({projectId: projectId}, function (err, collipacks) {
//                         if (err) {
//                             resolve({
//                                 isRejected: true,
//                                 message: 'an error occured while trying to retrive ColliPacks.' 
//                             });
//                         } else if (_.isEmpty(collipacks)) {
//                             resolve({
//                                 isRejected: false,
//                                 message: 'No ColliPacks.' 
//                             });
//                         } else {
//                             let tempPackIds = [];
//                             collipacks.map(collipack => {
//                                 if (!doesHave(projectCollis, collipack.plNr, collipack.colliNr)) {
//                                     tempPackIds.push(collipack._id);
//                                 }
//                             });
//                             if (_.isEmpty(tempPackIds)) {
//                                 resolve({
//                                     isRejected: false,
//                                     message: 'No ColliPacks are different than packitems.' 
//                                 }); 
//                             } else {
//                                 ColliPack.deleteMany({_id: { $in: tempPackIds } }, function (err) {
//                                     if (err) {
//                                         resolve({
//                                             isRejected: true,
//                                             message: 'An error has occured while removing ColliPacks.' 
//                                         });
//                                     } else {
//                                         resolve({
//                                             isRejected: false,
//                                             message: 'All collipacks have been removed.' 
//                                         });
//                                     }
//                                 });
//                             }
//                         }
//                     });
//                 } else {
//                     resolve({
//                         isRejected: false,
//                         message: 'no packitem colli(s) to be deleted.'
//                     })
//                 }
//             }
//         });
//     });
// }

function doesHave(array, plNr, colliNr) {
    return !!array.find(e => e.plNr == plNr && e.colliNr == colliNr);
}