const express = require('express');
const router = express.Router();
const DocCountTr = require('../../models/DocCountTr');

router.post('/', (req, res) => {
    const newDocCountTr = new DocCountTr({
        _id: req.body.id,
        seq: req.body.seq,
    });
    newDocCountTr
        .save()
        .then(doccounttr => { 
            res.json(doccounttr);
        })
        .catch(err => res.json(err));
});

module.exports = router;