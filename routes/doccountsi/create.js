const express = require('express');
const router = express.Router();
const DocCountSi = require('../../models/DocCountSi');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountSi = new DocCountSi({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountSi
                .save()
                .then(doccountsi => { 
                    res.json(doccountsi);
                })
                .catch(err => res.json(err));
});

module.exports = router;