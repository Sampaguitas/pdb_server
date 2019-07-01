const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocDef = new DocDef({
                // _id: req.body._id,
                code: req.body.code,
                location: req.body.location,
                field: req.body.field,
                description: req.body.description,
                row1: req.body.row1,
                col1: req.body.col1,
                grid: req.body.grid,
                worksheet1: req.body.worksheet1,
                worksheet2: req.body.worksheet2,
                row2: req.body.row2,
                col2: req.body.col2,
                doctypeId: req.body.doctypeId,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });

            newDocDef
                .save()
                .then(docdef => res.json(docdef))
                .catch(err => res.json(err));
});
module.exports = router;