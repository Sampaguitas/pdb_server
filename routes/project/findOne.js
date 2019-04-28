const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Project.findById(id).populate("opco", "name")
        .exec(function (err, project) {
            if (!project) {
                return res.status(400).json({
                    message: fault(1301).message
                    //"1301": "Project does not exist",
                });
            }
            else {
                return res.json(project);
            }
        });
});

module.exports = router;