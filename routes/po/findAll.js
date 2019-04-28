const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Po.find(data, function (err, po) {
        if (!po) {
            return res.status(400).json({ 
                message: fault(1204).message
                //"1204": "No Po match",
            });
        }
        else {
            return res.json(po);
        }
    });
});

module.exports = router;