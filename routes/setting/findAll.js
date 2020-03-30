const express = require('express');
const router = express.Router();
const Setting = require('../../models/Setting');

router.get('/', (req, res) => {
    Setting.find({
        projectId: req.query.projectId, 
        userId: req.query.userId
    }, function (err, settings) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        }
        else {
            return res.json(settings);
        }
    });
});

module.exports = router;