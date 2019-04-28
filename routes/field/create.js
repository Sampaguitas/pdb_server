const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newField = new Field({
                name: req.body.name,
                custom: req.body.custom,
                type: req.body.type,
                fromTbl: req.body.fromTbl,
                project: req.body.project
            });

            newField
                .save()
                .then(field => res.json(field))
                .catch(err => res.json(err));
});
module.exports = router;