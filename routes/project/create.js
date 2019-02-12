const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Project.findOne({ name: req.body.name }).then(project => {
        if (project) {
            return res.status(400).json({
                message: fault(500).message
                //"500": "Project already exists",
            });
        } else {
            const newProject = new Project({
                name: req.body.name,
                customer: req.body.customer,
                opco: req.body.opco,
                currency: req.body.currency,
                projectInspection: req.body.projectInspection,
                projectShipping: req.body.projectShipping,
                projectWarehouse: req.body.projectWarehouse,
                dave_ID: req.body.dave_ID
            });
            newProject
                .save()
                .then(project => res.json(project))
                .catch(err => res.json(err));
        }
    });
});

module.exports = router;