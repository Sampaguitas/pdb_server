const express = require('express');
const router = express.Router();
const DocCountEsr = require('../../models/DocCountEsr');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    const newDocCountEsr = new DocCountEsr({
        _id: req.body.id,
        seq: req.body.seq,
    });
    newDocCountEsr
        .save()
        .then(doccountesr => { 
            res.json(doccountesr);
        })
        .catch(err => res.json(err));
});

module.exports = router;