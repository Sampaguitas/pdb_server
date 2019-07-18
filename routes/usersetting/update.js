const express = require('express');
const router = express.Router();
const UserSetting = require('../../models/UserSetting');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    UserSetting.findByIdAndUpdate(id, { $set: data }, function (err, usersetting) {
        if (!usersetting) {
            return res.status(400).json({
                message: fault(1701).message
                //"1701": "UserSetting does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1702).message
                //"1702": "UserSetting has been updated",
            });
        }
    });
});

module.exports = router;
