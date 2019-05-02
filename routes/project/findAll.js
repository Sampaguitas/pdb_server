const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    // Project.find(data).populate("customer", "name code").populate("opco", "name").populate("user", "name")
    Project.find(data).populate("pos", "_id")
    .exec(function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(1304).message
                //"1304": "No Project match",
            });
        }
        else {
            return res.json(project);
        }
    });
});

module.exports = router;