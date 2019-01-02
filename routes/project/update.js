const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors')

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Project.findByIdAndUpdate(id, { $set: data }, function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(501).message
                // "501": "Project does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(502).message
                // "502": "Project has been updated",
            });
        }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/