const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Screen.findById(id, function (err, screen) {
        if (!screen) {
            return res.status(404).json({
                message: fault(2001).message
                //"2001": "Screen does not exist",
            });
        }
        else {
            return res.json(screen);
        }
    });
});


module.exports = router;
