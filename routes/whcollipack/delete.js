const express = require('express');
const router = express.Router();
const WhColliPack = require('../../models/WhColliPack');

router.delete('/', (req, res) => {
    const id = req.query.id
    WhColliPack.findByIdAndDelete(id, function (err, whcollipack) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!whcollipack) {
            return res.status(400).json({ message: 'Could not find WhColliPack.' });
        } else {
            return res.status(200).json({ message: 'WhColliPack has successfully been deleted' });
        }
    });
});

module.exports = router;