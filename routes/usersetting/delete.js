const express = require('express');
const router = express.Router();
const UserSetting = require('../../models/UserSetting');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    UserSetting.findByIdAndRemove(id, function (err, usersetting) {
        if (!usersetting) {
            return res.status(400).json({
                message: fault(1701).message
                //"1701": "UserSetting does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1703).message
                //"1703": "UserSetting has been deleted",
            });
        }
    });
});

module.exports = router;