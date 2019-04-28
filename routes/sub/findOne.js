const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Sub.findById(id, function (err, sub) {
        if (!sub) {
            return res.status(400).json({ 
                message: fault(1401).message
                //"1401": "Sub does not exist",
            });
        }
        else {
            return res.json(sub);
        }
    });
});

module.exports = router;