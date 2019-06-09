const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Project.findByIdAndRemove(id, function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(1301).message
                //"1301": "Project does not exist",
            });
        }
        else {
            Access.find({ projectId: project._id }).then(access => {
                access.map(user => {
                    Access.findByIdAndRemove(user._id);
                });
            });
            return res.status(200).json({
                message: fault(1303).message
                //"1303": "Project has been deleted",
            });
        }
    });
});
//

module.exports = router;