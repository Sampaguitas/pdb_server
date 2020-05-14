const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const _ =require('lodash');

router.put('/', (req, res) => {

    const projectId = req.query.id;
    const cifName = req.body.cifName;

    if (!projectId) {
        return res.status(400).json({ message: 'projectId is missing.'});
    } else {
        Project.findByIdAndUpdate(projectId, { $set: { cifName: cifName } }, function (err) {
            if (err) {
                return res.status(400).json({ message: 'cifName could not be updated.'});
            } else {
                return res.status(200).json({ message: 'cifName has successfully been updated!' });
            }
        });
    }
});

module.exports = router;