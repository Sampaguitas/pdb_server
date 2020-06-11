const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Heat = require('./Heat');
const HeatLoc = require('./HeatLoc');
const MirItem = require('./MirItem');
const Sub = require('./Sub');
const Transaction = require('./Transaction');
const _ = require('lodash');

//Create Schema
const PoSchema = new Schema({
    clPo: {
        type: String, //2
    },
    clPoRev: {
        type: String, //2
    },
    clPoItem: {
        type: Number, //2
    },
    clCode: {
        type: String, //2
    },
    qty: {
        type: Number,
    },
    uom: {
        type: String,
    },
    size:{
        type: String,
    },
    sch:{
        type: String,
    },
    description: {
        type: String,
    },
    material: {
        type: String, 
    },
    remarks: {
        type: String,
    },
    unitPrice: {
        type: Number,
    },
    vlContDelDate: {
        type: Date,
    },
    kind: {
        type: String,
    },
    vlSo: {
        type: String, //1
    },
    vlSoItem: {
        type: Number, //1
    },
    vlPo: {
        type: Number,
    },
    vlPoItem: {
        type: Number,
    },
    supplier: {
        type: String,
    },
    supSo: {
        type: String,
    },
    supSoItem: {
        type: String,
    },
    vlArtNo: {
        type: Number,
    },
    supContrDate: {
        type: Date,
    },
    comments: {
        type: String,        
    },
    vlDelCondition: {
        type: String,      
    },
    supDelCondition: {
        type: String, 
    },
    devRemarks: {
        type: String,     
    },
    clDescription: {
        type: String,      
    },
    s1: {
        type: Number,   
    },
    s2: {
        type: Number,    
    },
    dn1: {
        type: Number,    
    },
    dn2: {
        type: Number,    
    },
    vlArtNoX: {
        type: String,  
    },
    itemX:{
        type: String,
    },
    vlPoX: {
        type: String,
    },
    vlPoItemX: {
        type: String,
    },
    udfPoX1: {
        type: String,
    },
    udfPoX2: {
        type: String,
    },
    udfPoX3: {
        type: String,
    },
    udfPoX4: {
        type: String,
    },
    udfPoX5: {
        type: String,
    },
    udfPoX6: {
        type: String,
    },
    udfPoX7: {
        type: String,
    },
    udfPoX8: {
        type: String,
    },
    udfPoX9: {
        type: String,
    },
    udfPoX10: {
        type: String,
    },
    udfPo91: {
        type: Number,
    },
    udfPo92: {
        type: Number,
    },
    udfPo93: {
        type: Number,
    },
    udfPo94: {
        type: Number,
    },
    udfPo95: {
        type: Number,
    },
    udfPo96: {
        type: Number,
    },
    udfPo97: {
        type: Number,
    },
    udfPo98: {
        type: Number,
    },
    udfPo99: {
        type: Number,
    },
    udfPo910: {
        type: Number,
    },
    udfPoD1: {
        type: Date,
    },
    udfPoD2: {
        type: Date,
    },
    udfPoD3: {
        type: Date,
    },
    udfPoD4: {
        type: Date,
    },
    udfPoD5: {
        type: Date,
    },
    udfPoD6: {
        type: Date,
    },
    udfPoD7: {
        type: Date,
    },
    udfPoD8: {
        type: Date,
    },
    udfPoD9: {
        type: Date,
    },
    udfPoD10: {
        type: Date,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'  
    },
    daveId: {
        type: Number,
    }
});

PoSchema.virtual("project", {
    ref: "projects",
    localField: "projectId",
    foreignField: "_id",
    justOne: true
});

PoSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});


PoSchema.virtual("subs", {
    ref: "subs",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});

PoSchema.virtual("heats", {
    ref: "heats",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});

PoSchema.set('toJSON', { virtuals: true });


PoSchema.post('findOneAndDelete', function(doc, next) {
    let poId = doc._id;
    findSubs(poId).then( () => {
        findHeats(poId).then( () => {
            findHeatLocs(poId).then( () => {
                findMirItems(poId).then( () => {
                    findTransactions(poId).then( () => {
                        next()
                    });
                });
            });
        });
    }); 
});

function findSubs(poId) {
    return new Promise(function (resolve) {
        if (!poId) {
            resolve();
        } else {
            Sub.find({ poId: poId }, function (err, subs) {
                if (err || _.isEmpty(subs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    subs.map(sub => myPromises.push(deleteSub(sub._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteSub(subId) {
    return new Promise(function(resolve) {
        if (!subId) {
            resolve();
        } else {
            Sub.findByIdAndDelete(subId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findHeats(poId) {
    return new Promise(function (resolve) {
        if (!poId) {
            resolve();
        } else {
            Heat.find({ poId: poId }, function (err, heats) {
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

function findHeatLocs(poId) {
    return new Promise(function (resolve) {
        if (!poId) {
            resolve();
        } else {
            HeatLoc.find({ poId: poId }, function (err, heatlocs) {
                if (err || _.isEmpty(heatlocs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heatlocs.map(heatloc => myPromises.push(deleteHeatLoc(heatloc._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeatLoc(heatlocId) {
    return new Promise(function(resolve) {
        if (!heatlocId) {
            resolve();
        } else {
            HeatLoc.findByIdAndDelete(heatlocId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findMirItems(poId) {
    return new Promise(function (resolve) {
        if (!poId) {
            resolve();
        } else {
            MirItem.find({ poId: poId }, function (err, miritems) {
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

function findTransactions(poId) {
    return new Promise(function (resolve) {
        if (!poId) {
            resolve();
        } else {
            Transaction.find({ poId: poId }, function (err, transactions) {
                if (err || _.isEmpty(transactions)) {
                    resolve();
                } else {
                    let myPromises = [];
                    transactions.map(transaction => myPromises.push(deleteTransaction(transaction._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteTransaction(transactionId) {
    return new Promise(function(resolve) {
        if (!transactionId) {
            resolve();
        } else {
            Transaction.findByIdAndDelete(transactionId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

module.exports = Po = mongoose.model('pos', PoSchema);