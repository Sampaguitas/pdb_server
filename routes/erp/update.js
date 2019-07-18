const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Erp.findByIdAndUpdate(id, { $set: data }, function (err, erp) {
        if (!erp) {
            return res.status(400).json({
                message: fault(0601).message
                //"0601": "Erp does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0602).message
                //"0602": "Erp has been updated",
            });
        }
    });
});

module.exports = router;
