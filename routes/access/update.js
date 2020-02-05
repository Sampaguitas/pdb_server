const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Access.findByIdAndUpdate(id, { $set: data }, function (err, access) {
        if (!access) {
            return res.status(400).json({
                message: 'Access does not exist'
                //"2101": "Access does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Access has been updated'
                //"2102": "Access has been updated",
            });
        }
    });
});

module.exports = router;
