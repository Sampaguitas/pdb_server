const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Erp.find(data, function (err, erp) {
        if (!erp) {
            return res.status(400).json({
                message: fault(704).message
                //"704": "No Erp match",
            });
        }
        else {
            return res.json(erp);
        }
    });
});

module.exports = router;