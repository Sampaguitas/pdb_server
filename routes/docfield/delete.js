const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const _ = require('lodash');

router.delete('/', async (req, res) => {

    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        DocField.find({_id: {$in: selectedIds} }, function (err, docfields) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'}); 
            } else if (!docfields) {
                return res.status(400).json({message: 'could not find DocFields.'}); 
            } else {
                docfields.map(docfield => myPromises.push(deleteDocField(docfield._id)));
                Promise.all(myPromises).then(results => {
                    results.map(result => {
                        if (result.isRejected) {
                            nRejected++;
                        } else {
                            nDeleted++;
                        }
                    });
                    res.status(!!nRejected ? 400 : 200).json({ message: `${nDeleted} items deleted, ${nRejected} items rejected.`});
                });
            }
        });
    }
    // const parsedId = JSON.parse(req.query.id);
    
    // if (_.isEmpty(parsedId)) {
    //     return res.status(400).json({message: 'You need to pass an Id'});
    // } else {
    //     DocField.deleteMany({_id: { $in: parsedId } }, function (err) {
    //         if (err) {
    //             return res.status(400).json({message: 'An error has occured'});
    //         } else {
    //             return res.status(200).json({message: 'Done'});
    //         }
    //     });
    // }
});

function deleteDocField(docfieldId) {
    return new Promise(function (resolve) {
        DocField.findByIdAndDelete(docfieldId, function (err, res) {
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