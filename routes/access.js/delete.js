const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Access.findByIdAndRemove(id, function (err, access) {
        if (!access) {
            return res.status(400).json({
                message: fault(2101).message
                //"2101": "Access does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2103).message,
                //"2103": "Access has been deleted",
            });
        }
    });
});

module.exports = router;