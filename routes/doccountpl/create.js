const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountPl = new DocCountPl({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountPl
                .save()
                .then(doccountpl => { 
                    res.json(doccountpl);
                })
                .catch(err => res.json(err));
});

module.exports = router;