const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');

router.delete('/', (req, res) => {
    const id = req.query.id
    ColliPack.findByIdAndDelete(id, function (err, collipack) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!collipack) {
            return res.status(400).json({ message: 'Could not find ColliPack.' });
        } else {
            return res.status(200).json({ message: 'ColliPack has successfully been deleted' });
        }
    });
});

module.exports = router;