const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountSm = new DocCountSm({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountSm
                .save()
                .then(doccountsm => { 
                    res.json(doccountsm);
                })
                .catch(err => res.json(err));
});

module.exports = router;