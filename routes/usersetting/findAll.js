const express = require('express');
const router = express.Router();
const UserSetting = require('../../models/UserSetting');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    UserSetting.find(data, function (err, usersetting) {
        if (!usersetting) {
            return res.status(400).json({ 
                message: fault(1704).message
                //"1704": "No UserSetting match",
            });
        }
        else {
            return res.json(usersetting);
        }
    });
});

module.exports = router;