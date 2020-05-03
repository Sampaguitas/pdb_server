const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.post('/', (req, res) => {
            const newDocCountSh = new DocCountSh({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newDocCountSh
                .save()
                .then(doccountsh => { 
                    res.json(doccountsh);
                })
                .catch(err => res.json(err));
});

module.exports = router;