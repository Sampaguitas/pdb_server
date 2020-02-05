const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    ColliPack.findById(id, function (err, collipack) {
        if (!collipack) {
            return res.status(404).json({
                message: 'ColliPack does not exist'
                //"0201": "ColliPack does not exist",
            });
        }
        else {
            return res.json(collipack);
        }
    });
});


module.exports = router;
