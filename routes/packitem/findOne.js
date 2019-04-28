const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    PackItem.findById(id, function (err, packitem) {
        if (!packitem) {
            return res.status(400).json({ 
                message: fault(1101).message
                //"1101": "PackItem does not exist",
            });
        }
        else {
            return res.json(packitem);
        }
    });
});

module.exports = router;