const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var projectId = req.query.projectId;

    Po.find(projectId, 'clPo clPoRev',  function (err, po) {
        if (!po) {
            return res.status(400).json({ 
                message: fault(1204).message
                //"1204": "No Po match",
            });
        }
        else {
            return res.json(po);
        }
    });
});

module.exports = router;
