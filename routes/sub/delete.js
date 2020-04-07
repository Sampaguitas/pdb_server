const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    // const id = req.query.id
    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        selectedIds.map(selectedId => !!selectedId.subId && myPromises.push(removeSub(selectedId.subId)));
        
        await Promise.all(myPromises).then(function (resPromises) {
            resPromises.map(function (resPromise) {
                if (resPromise.isRejected) {
                    nRejected += nRejected + 1;
                } else {
                    nDeleted += nDeleted + 1;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({message: `${nDeleted} item(s) deleted, ${nRejected} item(s) rejected.`});
        });

    }
});

function removeSub(id) {
    return new Promise(function(resolve) {
        condition = { _id: id};
        Sub.findOneAndDelete(condition, function (err) {
            if(err) {
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

    // Sub.findByIdAndRemove(id, function (err, sub) {
    //     if (!sub) {
    //         return res.status(400).json({
    //             message: fault(1401).message
    //             //"1401": "Sub does not exist",
    //         });
    //     }
    //     else {
    //         return res.status(200).json({
    //             message: fault(1403).message
    //             //"1403": "Sub has been deleted",
    //         });
    //     }
    // });
// });

module.exports = router;