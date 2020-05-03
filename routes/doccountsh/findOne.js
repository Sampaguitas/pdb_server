const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountSh.findById(id, function (err, doccountsh) {
        if (err || !doccountsh) {
            return res.status(400).json({ message: 'DocCountSh does not exist' });
        } else {
            return res.json(doccountsh);
        }
    });
});

module.exports = router;