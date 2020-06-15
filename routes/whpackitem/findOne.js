const express = require('express');
const router = express.Router();
const WhPackItem = require('../../models/WhPackItem');

router.get('/', (req, res) => {
    const id = req.query.id
    WhPackItem.findById(id, function (err, whpackitem) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!whpackitem) {
            return res.status(400).json({ message: 'could not retreive whpackitem.' });
        } else {
            return res.status(200).json(whpackitem);
        }
    });
});

module.exports = router;