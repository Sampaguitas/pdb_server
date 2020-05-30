const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
// var s3bucket = require('../../middleware/s3bucket');
const _ = require('lodash');



router.delete('/', async (req, res) => {

    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        selectedIds.map(selectedId => myPromises.push(removeCertificate(selectedId)));
        await Promise.all(myPromises).then(function (resPromises) {
            resPromises.map(function (resPromise) {
                if (resPromise.isRejected) {
                    nRejected++;
                } else {
                    nDeleted++;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({message: `${nDeleted} item(s) deleted, ${nRejected} item(s) rejected.`});
        });
    }
});

function removeCertificate(id) {
    return new Promise(function(resolve) {
        Certificate.findByIdAndDelete(id, function (err) {
            if (err) {
                resolve({
                    isRejected: true
                });
            } else {
                resolve({
                    isRejected: false
                });
            }
        });
        // s3bucket.deleteCif(id)
        // .then( () => {
        //     condition = { _id: id};
        //     Certificate.findByIdAndDelete(id, function (err) {
        //         if(err) {
        //             resolve({
        //                 isRejected: true
        //             });
        //         } else {
        //             resolve({
        //                 isRejected: false
        //             });
        //         }
        //     });
        // }).catch( () => resolve({ isRejected: true }));
    });
}

module.exports = router;