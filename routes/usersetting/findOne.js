const express = require('express');
const router = express.Router();
const UserSetting = require('../../models/UserSetting');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    UserSetting.findById(id, function (err, usersetting) {
        if (!usersetting) {
            return res.status(400).json({ 
                message: fault(1701).message
                //"1701": "UserSetting does not exist",
            });
        }
        else {
            return res.json(usersetting);
        }
    });
});

module.exports = router;