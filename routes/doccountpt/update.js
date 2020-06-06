const express = require('express');
const router = express.Router();
const DocCountPt = require('../../models/DocCountPt');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountPt.findByIdAndUpdate(id, { $set: data }, function (err, doccountpt) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountpt) {
            return res.status(400).json({ message: 'DocCountPt does not exist.' });
        } else {
            return res.status(200).json({ message: 'DocCountPt has been updated.' });
        }
    });
});

module.exports = router;
