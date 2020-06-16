const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Article = require('./Article');
const PickItem = require('./PickItem');
const Po = require('./Po');
const _ = require('lodash');

//Create Schema
const MirItemSchema = new Schema({
    lineNr: {
        type: Number,
        // required: true,
    },
    qtyRequired: {
        type: Number,
        required: true,
    },
    unitWeight: {
        type: Number,
        default: 0,
    },
    mirId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'mirs',
        required: true,
    },
    poId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'pos',
        required: true,
    }
    
});

MirItemSchema.virtual('totWeight').get(function() { 
    if (!!this.qtyRequired || !!this.unitWeight) {
        return this.qtyRequired * this.unitWeight;
    } else {
        return 0;
    }
});

MirItemSchema.virtual('mir', {
    ref: 'mirs',
    localField: 'mirId',
    foreignField: '_id',
    justOne: true
});

MirItemSchema.virtual('po', {
    ref: 'pos',
    localField: 'poId',
    foreignField: '_id',
    justOne: true
});

MirItemSchema.virtual('pickitems', {
    ref: 'pickitems',
    localField: '_id',
    foreignField: 'miritemId',
    justOne: false
});

MirItemSchema.set('toJSON', { virtuals: true });

MirItemSchema.pre('save', function(next) {
    let self = this;
    if (!this.qtyRequired || this.qtyRequired <= 0) {
        self.invalidate("qtyRequired", 'is requred.');
        next({ message: 'qtyRequired cannot be null.' });
    } else {
        mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId }, function (err, miritems) {
            if (err) {
                self.invalidate("lineNr", "is required.");
                next({ message: 'Could not generate the lineNr.' });
            } else {
                let unique = miritems.reduce(function(acc, cur) {
                    if (!!acc && _isEqual(cur.poId, self.poId)) {
                        acc = false;
                    }
                    return acc;
                }, true);
                if (!unique) {
                    self.invalidate("poId", "Not unique");
                    next({ message: 'This line has already been added, MIR cannot contain twice the same item!' });
                } else if (_.isEmpty(miritems)){
                    self.lineNr = 1;
                    next();
                } else {
                    let lastLineNr = miritems.reduce(function (acc, cur) {
                        if (cur.lineNr > acc) {
                            acc = cur.lineNr;
                        }
                        return acc;
                    }, 0);
                    self.lineNr = lastLineNr + 1;
                    next();
                }
            }
        });
        // next();
    }
});

// MirItemSchema.pre('save', function(next) {
//     let self = this;
//     if (!this.qtyRequired || this.qtyRequired <= 0) {
//         self.invalidate("qtyRequired", 'is requred.');
//         next({ message: 'qtyRequired cannot be null.' });
//     } else {
//         next();
//     }
// });

// MirItemSchema.pre('save', function(next) {
//     let self = this;
//     mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId, poId: self.poId }, function (err, miritems) {
//         if (err) {
//             next(err);
//         } else if (!_.isEmpty(miritems)) {
//             self.invalidate("poId", "Not unique");
//             next({ message: 'This line has already been added, MIR cannot contain twice the same item!' });
//         } else {
//             next();
//         }
//     });
// });

// MirItemSchema.pre('save', function(next) {
//     let self = this;
//     mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId }, function (err, miritems) {
//         if (err) {
//             self.invalidate("lineNr", "is required.");
//             next({ message: 'Could not generate the lineNr.' });
//         } else if (_.isEmpty(miritems)) {
//             self.lineNr = 1;
//             next();
//         } else {
//             let lastLineNr = miritems.reduce(function (acc, cur) {
//                 if (cur.lineNr > acc) {
//                     acc = cur.lineNr;
//                 }
//                 return acc;
//             }, 0);
//             self.lineNr = lastLineNr + 1;
//             next();
//         }
//     });
// });

MirItemSchema.pre('save', function(next) {
    let self = this;
    Po.findById(self.poId).populate({
        path: 'project',
        populate: {
            path: 'erp'
        }
    }).exec(function (err, po) {
        if (err || !po) {
            next();
        } else {
            getArticle(po.project.erp.name, po.vlArtNo, po.vlArtNoX).then(article => {
                self.unitWeight = article.netWeight
                next();
            });
        }
    });
});

MirItemSchema.post('findOneAndDelete', function(doc, next) {
    let miritemId = doc._id;
    findPickItems(miritemId).then( () => {
        next()
    });
});

function getArticle(erp, vlArtNo, vlArtNoX) {
    return new Promise(function (resolve) {
        if (!vlArtNo && !vlArtNoX) {
            resolve({
                hsCode: '',
                netWeight: '', 
            });
        } else {
            let conditions = vlArtNo ? { erp: erp, vlArtNo : vlArtNo } : { erp: erp, vlArtNoX : vlArtNoX };
            Article.findOne(conditions, function (err, article) {
                if(err || _.isNull(article)) {
                    resolve({
                        hsCode: '',
                        netWeight: '', 
                    });
                } else {
                    resolve({
                        hsCode: article.hsCode,
                        netWeight: article.netWeight
                    });
                }
            });
        }
    });
}

function findPickItems(miritemId) {
    return new Promise(function (resolve) {
        if (!miritemId) {
            resolve();
        } else {
            PickItem.find({ miritemId: miritemId }, function (err, pickitems) {
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

module.exports = MirItem = mongoose.model('miritems', MirItemSchema);
