const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    User.findByIdAndRemove(id, function (err, user) {
        if (!user) {
            return res.status(400).json({
                res_no: 260,
                res_message: fault(260).message,
                // "260": "user does not exist"
            });
        }
        else {
            return res.status(200).json({
                res_no: 400,
                res_message: fault(400).message,
                //400: "Success"
            });
        }
    });
});

module.exports = router;