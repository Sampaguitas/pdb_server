const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newCounter = new Counter({
                _id: req.body.id,
                seq: req.body.seq,
            });
            newCounter
                .save()
                .then(project => { 
                    res.json(project);
                })
                .catch(err => res.json(err));
});

module.exports = router;