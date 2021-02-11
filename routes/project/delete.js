const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');

router.delete('/', (req, res) => {
    if (!req.user.isAdmin && !req.user.isSuperAdmin) {
        res.status(400).json({message: "You do not have permission to delete this projects, please contact your admin."})
    } else {
        Project.findByIdAndDelete(req.query.id, function(err, project) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!project) {
                return res.status(400).json({ message: 'Could not find project.' });
            } else {
                return res.status(200).json({ message: 'Project has successfully been deleted.'});
            }
        });
    }
});

module.exports = router;