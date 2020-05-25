const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const _ = require('lodash');

router.delete('/', async (req, res) => {

    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        FieldName.find({_id: {$in: selectedIds} }, function (err, fieldnames) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'}); 
            } else if (!fieldnames) {
                return res.status(400).json({message: 'could not find FieldNames.'}); 
            } else {
                fieldnames.map(fieldname => myPromises.push(deleteFieldName(fieldname._id)));
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
    //req.query.id: [%225d186291760cd9328dfa4ccd%22,%225d186290760cd9328dfa4c5f%22]
    //parsedId: ["5d186291760cd9328dfa4ccd","5d186290760cd9328dfa4c5f"]
    // const parsedId = JSON.parse(req.query.id);
    
    // if (_.isEmpty(parsedId)) {
    //     return res.status(400).json({message: 'You need to pass an Id.'});
    // } else {
    //     FieldName.deleteMany({_id: { $in: parsedId } }, function (err) {
    //         if (err) {
    //             return res.status(400).json({message: 'An error has occured.'});
    //         } else {
    //             return res.status(200).json({message: 'Done'});
    //         }
    //     });
    // }


});

function deleteFieldName(fieldnameId) {
    return new Promise(function (resolve) {
        FieldName.findByIdAndDelete(fieldnameId, function (err, res) {
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


