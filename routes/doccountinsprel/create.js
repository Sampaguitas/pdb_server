const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountInsprel = new DocCountInsprel({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountInsprel
                .save()
                .then(doccountinsprel => { 
                    res.json(doccountinsprel);
                })
                .catch(err => res.json(err));
});

module.exports = router;