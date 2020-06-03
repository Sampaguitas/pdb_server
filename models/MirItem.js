const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Article = require('./Article');
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

MirItemSchema.virtual('po', {
    ref: 'pos',
    localField: 'poId',
    foreignField: '_id',
    justOne: true
});

MirItemSchema.set('toJSON', { virtuals: true });

MirItemSchema.pre('save', function(next) {
    let self = this;
    if (!this.qtyRequired || this.qtyRequired < 0) {
        self.invalidate("qtyRequired", 'Qty is requred.');
        next({ message: 'Quantity Required cannot be null.' });
    } else {
        next();
    }
});

MirItemSchema.pre('save', function(next) {
    let self = this;
    mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId, poId: self.poId }, function (err, miritems) {
        if (err) {
            next(err);
        } else if (!_.isEmpty(miritems)) {
            self.invalidate("poId", "Not unique");
            next({ message: 'This line has already been added, MIR cannot contain twice the same item!' });
        } else {
            next();
        }
    });
});

MirItemSchema.pre('save', function(next) {
    let self = this;
    mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId }, function (err, miritems) {
        if (err) {
            self.invalidate("lineNr", "lineNr is required.");
            next({ message: 'Could not generate the Line Number.' });
        } else if (_.isEmpty(miritems)) {
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
    });
});

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

module.exports = MirItem = mongoose.model('miritems', MirItemSchema);

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