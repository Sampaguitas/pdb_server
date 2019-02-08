const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Project.findByIdAndRemove(id, function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(501).message
                //"501": "Project does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(503).message
                //"503": "Project has been deleted",
            });
        }
    });
});

module.exports = router;