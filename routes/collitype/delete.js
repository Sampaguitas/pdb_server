const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');
const _ = require('lodash');

router.delete('/', (req, res) => {
    // const id = req.query.id
    const parsedId = JSON.parse(req.query.id);
    if (_.isEmpty(parsedId)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        ColliType.deleteMany({_id: {$in: parsedId} }, function (err) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'});
            } else {
                return res.status(200).json({message: 'Done.'}); 
            }
        });
    }
    // ColliType.findByIdAndRemove(id, function (err, collitype) {
    //     if (!collitype) {
    //         return res.status(400).json({
    //             message: 'ColliType does not exist'
    //             //"0301": "ColliType does not exist",
    //         });
    //     }
    //     else {
    //         return res.status(200).json({
    //             message: 'ColliType has been deleted'
    //             //"0303": "ColliType has been deleted",
    //         });
    //     }
    // });
});

module.exports = router;