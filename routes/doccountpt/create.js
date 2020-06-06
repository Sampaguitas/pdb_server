const express = require('express');
const router = express.Router();
const DocCountPt = require('../../models/DocCountPt');

router.post('/', (req, res) => {
            const newDocCountPt = new DocCountPt({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountPt
                .save()
                .then(doccountpt => { 
                    res.json(doccountpt);
                })
                .catch(err => res.json(err));
});

module.exports = router;