const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const ColliPack = require('../../models/ColliPack');
const Article = require('../../models/Article');
const _ = require('lodash');

router.put('/', (req, res) => {
    
    let erp = req.body.erp;
    let selectedIds = req.body.selectedIds;
    
    let collipackIds = [];
    let itemsWeight = [];
    let collisWeight = [];
    let nRejected = 0;
    let nEdited = 0;

    if (_.isUndefined(selectedIds) || _.isEmpty(selectedIds)) {
        res.status(400).json({ message: 'selectedId(s) are missing.'});
    } else if (!erp) {
        res.status(400).json({ message: 'Erp is missing.'});
    } else {

        selectedIds.forEach(element => {
            element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
        });

        PackItem.find({ collipackId: { $in: collipackIds} })
        .populate({
            path: 'sub',
            populate: {
                path: 'po'
            }
        })
        .exec(async function (err, packitems) {
            if (err) {
                res.status(400).json({ message: 'An error has occured.'});
            } else {

                packitems.map(function(packitem) {
                    itemsWeight.push(getweight(erp, packitem.pcs, packitem.mtrs, packitem.collipackId,  packitem.sub.po.uom, packitem.sub.po.vlArtNo, packitem.sub.po.vlArtNoX));
                });

                await Promise.all(itemsWeight).then(async resItemsWeight => {
                    
                    let myCollis = resItemsWeight.reduce(function (acc, cur) {
                        if (!cur.isRejected) {
                           if (acc.hasOwnProperty([cur.collipackId])) {
                            acc[cur.collipackId] += cur.weight;
                           } else {
                            acc[cur.collipackId] = cur.weight;
                           }
                        }
                        return acc;
                    }, {});

                    Object.keys(myCollis).forEach(function (k) {
                        collisWeight.push(setWeight(k, myCollis[k]));
                    });

                    await Promise.all(collisWeight).then(async resCollisWeight => {
                        
                        resCollisWeight.map(resColliWeight => {
                            if (resColliWeight.isRejected) {
                                nRejected++;
                            } else {
                                nEdited++;
                            }
                        });

                        res.status(nRejected ? 400 : 200).json({ message: `${nEdited} items edited, ${nRejected} items rejected.`});

                    });
                });
            }
        });
    }

});

module.exports = router;

function setWeight(collipackId, netWeight) {
    return new Promise(function (resolve) {
        ColliPack.findByIdAndUpdate(collipackId, { $set: { netWeight: netWeight } }, function(err) {
            if(err) {
                resolve({
                    isRejected: true,
                });
            } else {
                resolve({
                    isRejected: false,
                });
            }
        })
    });
}

function getweight(erp, pcs, mtrs, collipackId, uom, vlArtNo, vlArtNoX) {
    return new Promise(function(resolve) {
        if (!vlArtNo && !vlArtNoX) {
            resolve({
                weight: 0,
                collipackId: collipackId,
                isRejected: true,
                reason: 'Article number is missing.'
            });
        } else if(!uom){
            resolve({
                weight: 0,
                collipackId: collipackId,
                isRejected: true,
                reason: 'Unit of mesurement is missing.'
            });
        } else {
            let tempUom = 'pcs';
            if (['M', 'MT', 'MTR', 'MTRS', 'LM'].includes(uom.toUpperCase())) {
                tempUom = 'mtrs';
            } else if (['F', 'FT', 'FEET', 'FEETS'].includes(uom.toUpperCase())) {
                tempUom = 'feets';
            } else if (uom.toUpperCase() === 'MT') {
                tempUom = 'mt';
            }

            let conditions = vlArtNo ? { erp: erp, vlArtNo : vlArtNo } : { erp: erp, vlArtNoX : vlArtNoX };
            Article.findOne(conditions, function (err, article) {
                if (err) {
                    resolve({
                        weight: 0,
                        collipackId: collipackId,
                        isRejected: true,
                        reason: 'An error occured.'
                    });
                } else if (_.isNull(article)) {
                    resolve({
                        weight: 0,
                        collipackId: collipackId,
                        isRejected: true,
                        reason: 'Could not find article weight.'
                    });
                } else {
                    resolve({
                        weight: calcWeight(tempUom, pcs, mtrs, article.netWeight),
                        collipackId: collipackId,
                        isRejected: false,
                        reason: 'Could not find article weight.'
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