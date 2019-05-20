const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Access.findOne({
        projectId: req.body.projectId,
        userId: req.body.userId
    }).then(access => {
        if (access) {
            return res.status(400).json({
                message: fault(2100).message
                //"2100": "Access already exists",
            });
        } else {
            const newAccess = new Access({
                isExpediting: req.body.isExpediting,
                isInspection: req.body.isInspection,
                isShipping: req.body.isShipping,
                isWarehouse: req.body.isWarehouse,
                isConfiguration: req.body.isConfiguration,
                projectId: req.body.projectId,
                userId: req.body.userId,
            });
            newAccess
                .save()
                .then(access => res.json(access))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;