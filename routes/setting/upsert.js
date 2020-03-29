const express = require('express');
const router = express.Router();
const Setting = require('../../models/Setting');

router.put('/', (req, res) => {
    let params = req.body.params;
    let screenId = req.body.screenId;
    let userId = req.body.userId;
    let projectId = req.body.projectId;
    if (!screenId) {
        res.status(400).json({ message: 'screenId is missing'});
    } else if (!userId) {
        res.status(400).json({ message: 'userId is missing'});
    } else if (!projectId) {
        res.status(400).json({ message: 'projectId is missing'});
    } else {
        let filter = { screenId: screenId, userId: userId, projectId: projectId };
        let update = { params: params };
        Setting.findOneAndUpdate(filter, update, { new: true, upsert: true }, function (err) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                return res.status(200).json({ message: 'User Settings have been saved/updated.'});
            }
        });
    }
});

module.exports = router;
