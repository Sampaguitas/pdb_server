const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const Article = require('../../models/Article');
const _ = require('lodash');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

router.put('/', (req, res) => {
    let colliType =  req.body.colliType;
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
    } else if (!colliType) {
        res.status(400).json({ message: 'colliType is missing.'});
    } else {
        let type = colliType.type || '';
        let length = colliType.length || 0;
        let width = colliType.width || 0;
        let height = colliType.height || 0; 
        let pkWeight = colliType.pkWeight || 0;

        selectedIds.forEach(element => {
            element.collipackId && !collipackIds.includes(new ObjectId(element.collipackId)) && collipackIds.push(new ObjectId(element.collipackId));
        });

        ColliPack.aggregate([
            {
                "$match": {
                    "_id": { "$in": collipackIds} 
                }
            },
            {
                "$lookup": {
                    "from": "packitems",
                    "let": { 
                        "collipack_projectId": "$projectId", 
                        "collipack_plNr": "$plNr", 
                        "collipack_colliNr": "$colliNr" 
                    },
                    "pipeline": [
                        { "$match":
                           { "$expr":
                              { "$and":
                                 [
                                   { "$eq": [ "$projectId",  "$$collipack_projectId" ] },
                                   { "$eq": [ { "$toDouble": "$plNr" },  { "$toDouble": "$$collipack_plNr" } ] },
                                   { "$eq": [ "$colliNr",  "$$collipack_colliNr" ] },
                                 ]
                              }
                           }
                        },
                        {
                            "$lookup": {
                                "from": "pos",
                                "localField": "poId",
                                "foreignField": "_id",
                                "as": "po"
                            }
                        },
                        {
                            "$addFields": {
                                "po": { "$arrayElemAt": [ "$po", 0] }
                            }
                        },
                        {
                            "$project": {
                                "pcs": 1,
                                "mtrs": 1,
                                "uom": "$po.uom",
                                "vlArtNo": "$po.vlArtNo",
                                "vlArtNoX": "$po.vlArtNoX"
                            }
                        }
                    ],
                    "as": "packitem"
                }
            },
            {
                "$project": {
                    "packitem": 1
                }
            },
            {
                "$unwind": "$packitem"
            }
        ]).exec(function (errCollipacks, collipacks) {
            if (!!errCollipacks) {
                res.status(400).json({ message: 'An error has occured.'});
            } else {
                collipacks.map(collipack => itemsWeight.push(getweight(erp, collipack.packitem.pcs, collipack.packitem.mtrs, collipack._id,  collipack.packitem.uom, collipack.packitem.vlArtNo, collipack.packitem.vlArtNoX)));
                Promise.all(itemsWeight).then(resItemsWeight => {
                    
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
                        collisWeight.push(updateColliPack(k, myCollis[k], type, length, width, height, pkWeight));
                    });

                    Promise.all(collisWeight).then(async resCollisWeight => {
                        
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

function updateColliPack(collipackId, netWeight, type, length, width, height, pkWeight) {
    return new Promise(function (resolve) {
        let grossWeight = !!netWeight ? netWeight + pkWeight : 0;
        let update = {
            $set: {
                type: type,
                length: length,
                width: width,
                height: height,
                grossWeight: grossWeight,
                netWeight: netWeight
            }
        }
        let options = { new: true };
        ColliPack.findByIdAndUpdate(collipackId, update, options, function(err) {
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