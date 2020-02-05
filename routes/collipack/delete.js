const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    ColliPack.findByIdAndRemove(id, function (err, collipack) {
        if (!collipack) {
            return res.status(400).json({
                message: 'ColliPack does not exist'
                //"0201": "ColliPack does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'ColliPack has been deleted',
                //"0203": "ColliPack has been deleted",
            });
        }
    });
});

module.exports = router;