const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {
    const id = req.query.id
    Project.findById(id).populate("customer", "name code").populate("opco", "name").populate("user", "name")
        .exec(function (err, project) {
            if (!project) {
                return res.status(400).json({
                    res_no: 501,
                    res_message: fault(501).message
                    // "501": "Project does not exist",
                });
            }
            else {
                return res.json(project);
            }
        });
});


module.exports = router;