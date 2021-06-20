const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const _ = require('lodash');


function alterArray(virtuals, poId, projectId) {
    virtuals.shift();
    let tempObject = {};
    return virtuals.reduce(function (acc, curr) {
        tempObject = curr;
        tempObject.poId = poId;
        tempObject.projectId = projectId;
        acc.push(tempObject);
        return acc;
    },[]);
}

router.put('/', (req, res) => {
    const virtuals = req.body.virtuals;
    const subId = req.query.subId;

    if (!_.isEmpty(virtuals)) {
        Sub
        .findByIdAndUpdate(subId, { $set: virtuals[0]})
        .then(result => {
          if (virtuals.length === 1) {
            return res.status(200).json({ message: 'Sub information was successfuly updated.' });
          } else {
            Sub
            .insertMany(alterArray(virtuals, result.poId, result.projectId)) //------------new projectId
            .then( () => {
                return res.status(200).json({ message: 'Sub lines where successfully created / updated.' });
            })
            .catch( () => {
                return res.status(400).json({message:'Sub information was updated however sub lines could not be created'});
            });
          }
        })
        .catch( () => {
            return res.status(400).json({message:'was not able to update sub information'});
        });
    } else {
        return res.status(400).json({message:'PUT request: wrong virtuals format'});
    }
});

module.exports = router;