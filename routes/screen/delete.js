const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Screen.findByIdAndRemove(id, function (err, screen) {
        if (!screen) {
            return res.status(400).json({
                message: fault(2001).message
                //"2001": "Screen does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2003).message,
                //"2003": "Screen has been deleted",
            });
        }
    });
});

module.exports = router;