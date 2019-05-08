const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Screen.find(data, function (err, screen) {
        if (!screen) {
            return res.status(400).json({
                message: fault(2004).message
                //"2004": "No Screen match",
            });
        }
        else {
            return res.json(screen);
        }
    });
});

module.exports = router;