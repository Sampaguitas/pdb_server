const express = require('express');
const router = express.Router();
const UserSetting = require('../../models/UserSetting');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

            const newUserSetting = new UserSetting({
                screen: req.body.screen,
                selectSettings: req.body.selectSettings,
                showSettings: req.body.showSettings,
                gridSettings: req.body.gridSettings,
                projectId: req.body.projectId,
                userId: req.body.userId,
                daveId: req.body.daveId,
            });

            newUserSetting
                .save()
                .then(usersetting => res.json(usersetting))
                .catch(err => res.json(err));

});
module.exports = router;