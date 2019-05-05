const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

function getNextSequence(name) {
    var ret = Counter.findByIdAndUpdate(name, { $inc: { seq: 1 }});
    return ret.seq;
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
                number: getNextSequence("projectNumber"), //req.body.number,
                name: req.body.name,
                erpId: req.body.erpId,
                localeId: req.body.localeId,
                opcoId: req.body.opcoId,
                daveId: req.body.daveId,
                users: req.body.users,
            });
            newProject
                .save()
                .then(project => { 
                    res.json(project);
                })
                .catch(err => res.json(err));
        }
    });

});

module.exports = router;