const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    Counter.find(data, function (err, counter) {
        if (!counter) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No Counter match",
            });
        }
        else {
            return res.json(counter);
        }
    });
});

module.exports = router;