const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocField = new DocField({
                location: req.body.location,
                row: req.body.row,
                col: req.body.col,
                grid: req.body.grid,
                param: req.body.param,
                worksheet: req.body.worksheet,
                docdefId: req.body.docdefId,
                fieldId: req.body.fieldId,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });

            newDocField
                .save()
                .then(docfield => res.json(docfield))
                .catch(err => res.json(err));
});
module.exports = router;