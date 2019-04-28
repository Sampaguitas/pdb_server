const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Sub.find(data, function (err, sub) {
        if (!sub) {
            return res.status(400).json({ 
                message: fault(1404).message
                //"1404": "No Sub match",
            });
        }
        else {
            return res.json(sub);
        }
    });
});

module.exports = router;