const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    MirItem.find(data, function (err, miritem) {
        if (!!err) {
            return res.status(400).json({ message: 'An error has occured.'})
        } else if (!miritem) {
            return res.status(400).json({ message: 'Could not retreive MIR items' });
        } else {
            return res.json(miritem);
        }
    });
});

module.exports = router;