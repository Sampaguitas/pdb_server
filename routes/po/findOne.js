const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Po.findById(id).populate("subs")
        .exec(function (err, project) {
            if (!po) {
                return res.status(400).json({ 
                    message: fault(1201).message
                    //"1201": "Po does not exist",
                });
            }
            else {
                return res.json(po);
            }
    });
});

module.exports = router;