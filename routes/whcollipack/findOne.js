const express = require('express');
const router = express.Router();
const WhColliPack = require('../../models/WhColliPack');

router.get('/', (req, res) => {
    const id = req.query.id
    WhColliPack.findById(id, function (err, whcollipack) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!whcollipack) {
            return res.status(400).json({ message: 'WhColliPack does not exist.' });
        } else {
            return res.status(200).json(whcollipack);
        }
    });
});


module.exports = router;
