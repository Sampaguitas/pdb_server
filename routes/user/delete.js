const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id;
    // // validate role
    // if(!req.user.isAdmin){

    // }
    User.findByIdAndRemove(id, function (err, user) {
        if (!user) {
            return res.status(400).json({
                message: fault(1601).message
                    //"1601": "User does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1603).message,
                //"1603": "User has been deleted",
            });
        }
    });
});

module.exports = router;