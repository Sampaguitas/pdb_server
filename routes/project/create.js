const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Counter = require('../../models/Counter');
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

function projectUsers(users) {
    return users.filter(function(user) {
        return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
    });
}

router.post('/', (req, res) => {
    Project.findOne({ name: req.body.name }).then(project => {
        if (project) {
            return res.status(400).json({
                message: fault(1300).message
                //"1300": "Project already exists",
            });
        } else {
            const newProject = new Project({
                // _id: req.body._id,
                // number: req.body.number,
                name: req.body.name,
                erpId: req.body.erpId,
                currencyId: req.body.currencyId,
                opcoId: req.body.opcoId,
                daveId: req.body.daveId,
            });
            newProject
                .save()
                .then(project => {
                    projectUsers(req.body.projectUsers).map(user => {
                        const newAccess = new Access({
                            isExpediting: user.isExpediting,
                            isInspection: user.isInspection,
                            isShipping: user.isShipping,
                            isWarehouse: user.isWarehouse,
                            isConfiguration: user.isConfiguration,
                            projectId: project._id,
                            userId: user.userId
                        });
                        newAccess.save();
                    });
                    res.json(project);
                })
                .catch(err => res.json(err));
        }
    });

});

module.exports = router;