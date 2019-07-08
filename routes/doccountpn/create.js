const express = require('express');
const router = express.Router();
const DocCountPn = require('../../models/DocCountPn');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountPn = new DocCountPn({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountPn
                .save()
                .then(doccountpn => { 
                    res.json(doccountpn);
                })
                .catch(err => res.json(err));
});

module.exports = router;