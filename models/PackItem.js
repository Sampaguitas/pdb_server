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

PackItemSchema.pre('findOneAndDelete', async function(next) {
    let myPromises = [];
    const packitem = await this.model.findOne(this.getQuery());
    if (!packitem) {
        next();
    } else {
        isUnique(packitem, false).then(res => {
            if (!res.isUnique) {
                next();
            } else {
                mongoose.model('collipacks').find({
                    plNr: packitem.plNr,
                    colliNr: packitem.colliNr,
                    projectId: packitem.projectId
                }).exec(function (errCollipacks, collipacks) {
                    if (!!errCollipacks || !collipacks) {
                        next();
                    } else {
                        collipacks.map(collipack => myPromises.push(deleteCollipack(collipack._id)));
                        Promise.all(myPromises).then(() => next());
                    }
                });
            }
        });
    }
});

PackItemSchema.pre('findOneAndUpdate', async function(next) {
    let myPromises = [];
    const packitem = await this.model.findOne(this.getQuery());
    if (!packitem || !this._update.hasOwnProperty('$set') || (!this._update['$set'].hasOwnProperty('plNr') && !this._update['$set'].hasOwnProperty('colliNr'))) {
        next();
    } else {
        isUnique(packitem, !!packitem.plNr && !!packitem.colliNr).then(res => {
            if (!res.isUnique) {
                next();
            } else {
                mongoose.model('collipacks').find({
                    plNr: packitem.plNr,
                    colliNr: packitem.colliNr,
                    projectId: packitem.projectId
                }).exec(function (errCollipacks, collipacks) {
                    if (!!errCollipacks || !collipacks) {
                        next();
                    } else {
                        collipacks.map(collipack => myPromises.push(deleteCollipack(collipack._id)));
                        Promise.all(myPromises).then(() => next());
                    }
                });
            }
        }); 
    }
});

PackItemSchema.post('findOneAndUpdate', function(doc, next) {
    // create a collipack if it does not exist already (with upsert)
    if (!doc.plNr || !doc.colliNr || !doc.projectId) {
        next();
    } else {
        
        let filter = { "plNr": doc.plNr, "colliNr": doc.colliNr, "projectId": doc.projectId };
        let update = { "plNr": doc.plNr, "colliNr": doc.colliNr, "projectId": doc.projectId };
        let options = { "new": true, "upsert": true };
        
        mongoose.model("collipacks").findOneAndUpdate(filter, update, options, () => next());
    }
});

module.exports = PackItem = mongoose.model('packitems', PackItemSchema);

function isUnique(packitem, noblank) {
    return new Promise(function(resolve) {
        if (!packitem.plNr || !packitem.colliNr || !packitem.projectId) {
            resolve({isUnique: false});
        } else {
            mongoose.model('packitems').find({
                plNr: packitem.plNr,
                colliNr: packitem.colliNr,
                projectId: packitem.projectId
            }).count(function (err, count) {
                if (!!err || count > 1) { //!!err || count + noblank > 1
                    resolve({isUnique: false});
                } else {
                    resolve({isUnique: true});
                }
            });
        }
    });
}

function deleteCollipack(_id) {
    return new Promise(function(resolve) {
        mongoose.model("collipacks").findOneAndDelete({_id}, function(err, res) {
            if (!!err) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}