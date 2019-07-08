const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountNfi = new DocCountNfi({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountNfi
                .save()
                .then(doccountnfi => { 
                    res.json(doccountnfi);
                })
                .catch(err => res.json(err));
});

module.exports = router;