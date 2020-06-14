const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const _ = require('lodash');

router.delete('/', (req, res) => {
    
    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        Supplier.find({_id: {$in: selectedIds} }, function (err, suppliers) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'}); 
            } else if (!suppliers) {
                return res.status(400).json({message: 'could not find Suppliers.'}); 
            } else {
                suppliers.map(supplier => myPromises.push(deleteSupplier(supplier._id)));
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
    //     Supplier.deleteMany({_id: { $in: parsedId } }, function (err) {
    //         if (err) {
    //             return res.status(400).json({message: 'An error has occured'});
    //         } else {
    //             return res.status(200).json({message: 'Done'});
    //         }
    //     });
    // }
});

function deleteSupplier(supplierId) {
    return new Promise(function (resolve) {
        Supplier.findByIdAndDelete(supplierId, function (err, res) {
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