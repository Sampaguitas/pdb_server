const express = require('express');
const router = express.Router();
const DocCountPt = require('../../models/DocCountPt');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountPt.findById(id, function (err, doccountpt) {
            if (!doccountpt) {
                return res.status(400).json({ message: 'DocCountPt does not exist' });
            }
            else {
                return res.json(doccountpt);
            }
        });
});

module.exports = router;