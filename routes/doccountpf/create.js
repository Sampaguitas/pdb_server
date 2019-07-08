const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountPf = new DocCountPf({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountPf
                .save()
                .then(doccountpf => { 
                    res.json(doccountpf);
                })
                .catch(err => res.json(err));
});

module.exports = router;