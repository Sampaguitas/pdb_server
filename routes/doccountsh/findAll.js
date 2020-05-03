const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountSh.find(data, function (err, doccountsh) {
        if (err || !doccountsh) {
            return res.status(400).json({ message: 'No DocCountSh match' });
        } else {
            return res.json(doccountsh);
        }
    });
});

module.exports = router;