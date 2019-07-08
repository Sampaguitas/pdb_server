const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocCountInspect = new DocCountInspect({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountInspect
                .save()
                .then(doccountinspect => { 
                    res.json(doccountinspect);
                })
                .catch(err => res.json(err));
});

module.exports = router;