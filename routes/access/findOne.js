const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Access.findById(id, function (err, access) {
        if (!access) {
            return res.status(404).json({
                message: fault(2101).message
                //"2101": "Access does not exist",
            });
        }
        else {
            return res.json(access);
        }
    });
});


module.exports = router;
