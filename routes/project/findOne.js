const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');

router.get('/', (req, res) => {
    const id = req.query.id
    Project.findById(id)
    .exec(function (err, project) {
            if (err) {
                return res.status(400).json({ message: 'Could not retreive project info.'});
            }
            else {
                return res.json(project);
            }
        });
});

module.exports = router;