const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newFieldName = new FieldName({
                align: req.body.align,
                edit: req.body.edit,
                forSelect: req.body.forSelect,
                forShow: req.body.forShow,
                screen: req.body.screen,
                project: req.body.project,
                field: req.body.field,
            });

            newFieldName
                .save()
                .then(fieldname => res.json(fieldname))
                .catch(err => res.json(err));
});
module.exports = router;