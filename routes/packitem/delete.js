const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    PackItem.findByIdAndRemove(id, function (err, packitem) {
        if (!packitem) {
            return res.status(400).json({
                message: fault(1101).message
                //"1101": "PackItem does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1103).message
                //"1103": "PackItem has been deleted",
            });
        }
    });
});

module.exports = router;