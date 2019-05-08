const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Screen.findOne({ name: req.body.name }).then(screen => {
        if (screen) {
            return res.status(400).json({
                message: fault(2000).message
                //"2000": "Screen already exists",
            });
        } else {

            const newScreen = new Screen({
                name: req.body.name,
                daveId: req.body.daveId
            });

            newScreen
                .save()
                .then(screen => res.json(screen))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;