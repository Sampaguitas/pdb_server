const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');
const _ = require('lodash');

router.delete('/', (req, res) => {
    const parsedId = JSON.parse(req.query.id);
    if (_.isEmpty(parsedId)) {
        return res.status(400).json({message: 'You need to pass an Id'});
    } else {
        Supplier.deleteMany({_id: { $in: parsedId } }, function (err) {
            if (err) {
                return res.status(400).json({message: 'An error has occured'});
            } else {
                return res.status(200).json({message: 'Done'});
            }
        });
    }
});

module.exports = router;