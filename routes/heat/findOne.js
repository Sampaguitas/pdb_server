const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.get('/', (req, res) => {
    Heat.findById(req.query.id, function (err, heat) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!heat) {
            return res.status(404).json({ message: 'Could not retreive the heat.'});
        } else {
            return res.json(heat);
        }
    });
});


module.exports = router;
