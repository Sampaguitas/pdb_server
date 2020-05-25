const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const _ = require('lodash');

router.delete('/', (req, res) => {
    
    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        ColliType.find({_id: {$in: selectedIds} }, function (err, collitypes) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'}); 
            } else if (!collitypes) {
                return res.status(400).json({message: 'could not find ColliTypes.'}); 
            } else {
                collitypes.map(collitype => myPromises.push(deleteColliType(collitype._id)));
                Promise.all(myPromises).then(results => {
                    results.map(result => {
                        if (result.isRejected) {
                            nRejected++;
                        } else {
                            nDeleted++;
                        }
                    });
                    res.status(!!nRjected ? 400 : 200).json({ message: `${nDeleted} items deleted, ${nRejected} items rejected.`});
                });
            }
        });
    }
        // const id = req.query.id
        // const parsedId = JSON.parse(req.query.id);
            // ColliType.deleteMany({_id: {$in: parsedId} }, function (err) {
        //     if (err) {
        //         return res.status(400).json({message: 'An error has occured.'});
        //     } else {
        //         return res.status(200).json({message: 'Done.'}); 
        //     }
        // });
});

function deleteColliType(collitypeId) {
    return new Promise(function (resolve) {
        ColliType.findByIdAndDelete(collitypeId, function (err, res) {
            if (err || !res) {
                resolve({
                    isRejected: true
                });
            } else {
                resolve({
                    isRejected: false
                });
            }
        });
    });
}



module.exports = router;