const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountSh.findByIdAndUpdate(id, { $set: data }, function (err, doccountsh) {
        if (err || !doccountsh) {
            return res.status(400).json({ message: 'DocCountSh does not exist' });
        } else {
            return res.status(200).json({ message: 'DocCountSh has been updated' });
        }
    });
});

module.exports = router;
