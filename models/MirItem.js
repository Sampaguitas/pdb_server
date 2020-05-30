const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Article = require('./Article');
const Po = require('./Po');
const _ = require('lodash');

//Create Schema
const MirItemSchema = new Schema({
    lineNr: {
        type: Number,
        required: true,
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
    mongoose.model('miritems', MirItemSchema).find({ mirId: self.mirId }, function (err, miritems) {
        if (err) {
            self.invalidate("lineNr", "Could not generate lineNr.");
        } else if (_.isEmpty(miritems)) {
            self.lineNr = 1;
        } else {
            let lastLineNr = miritems.reduce(function (acc, cur) {
                if (cur.lineNr > acc) {
                    acc = cur.lineNr;
                }
                return acc;
            }, 0);
            self.lineNr = lastLineNr + 1;
        }
        next();
    });
});

MirItemSchema.pre('save', function(next) {
    let self = this;
    Po.findById(self.poId, function (err, po) {
        if (err || !po) {
            self.invalidate("qtyRequired", "Could not retreive quantity Required.");
        } else {
            getArticle(po.erp, po.pcs, po.mtrs, po.uom, po.vlArtNo, po.vlArtNoX).then(article => {
                self.qtyRequired = po.qty
                self.unitWeight = article.netWeight
                next();
            });
        }
    });
});

module.exports = MirItem = mongoose.model('miritems', MirItemSchema);

function getArticle(erp, pcs, mtrs, uom, vlArtNo, vlArtNoX) {
    return new Promise(function (resolve) {
        if (!vlArtNo && !vlArtNoX) {
            resolve({
                hsCode: '',
                netWeight: '', 
            });
        } else {
            let conditions = vlArtNo ? { erp: erp, vlArtNo : vlArtNo } : { erp: erp, vlArtNoX : vlArtNoX };
            Article.findOne(conditions, function (err, article) {
                let tempUom = 'pcs';
                if (!!uom && ['M', 'MT', 'MTR', 'MTRS', 'LM'].includes(uom.toUpperCase())) {
                    tempUom = 'mtrs';
                } else if (!!uom && ['F', 'FT', 'FEET', 'FEETS'].includes(uom.toUpperCase())) {
                    tempUom = 'feets';
                } else if (!!uom && uom.toUpperCase() === 'MT') {
                    tempUom = 'mt';
                }

                if(err || _.isNull(article)) {
                    resolve({
                        hsCode: '',
                        netWeight: '', 
                    });
                } else {
                    resolve({
                        hsCode: article.hsCode,
                        netWeight: calcWeight(tempUom, pcs, mtrs, article.netWeight)
                    });
                }
            });
        }
    });
}

function calcWeight(tempUom, pcs, mtrs, weight) {
    switch(tempUom) {
        case 'pcs': return pcs * weight || 0;
        case 'mtrs': return mtrs * weight || 0;
        case 'feets': return mtrs * 0.3048 * weight || 0;
        case 'mt': return mtrs / 1000 || 0;
        default: return 0;
    }
}

