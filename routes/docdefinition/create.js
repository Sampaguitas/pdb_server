const express = require('express');
const router = express.Router();
const DocDefinition = require('../../models/DocDefinition');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocDefinition = new DocDefinition({
                code: req.body.code,
                location: req.body.location,
                field: req.body.field,
                description: req.body.description,
                row: req.body.row,
                col: req.body.col,
                grid: req.body.grid,
                param: req.body.param,
                worksheet1: req.body.worksheet1,
                worksheet2: req.body.worksheet2,
                row1: req.body.row1,
                row2: req.body.row2,
                type: req.body.type,
                fieldId: req.body.fieldId,
                daveId: req.body.daveId,
            });

            newDocDefinition
                .save()
                .then(docdefinition => res.json(docdefinition))
                .catch(err => res.json(err));
});
module.exports = router;