const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    DocDef.find({projectId: req.query.projectId}, function (err, docdef) {
        if (!docdef) {
            return res.status(400).json({
                message: 'No DocDef match'
                //"0404": "No DocDef match",
            });
        }
        else {
            return res.json(docdef);
        }
    });
});

module.exports = router;