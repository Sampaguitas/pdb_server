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
                screenId: req.body.screenId,
                fieldId: req.body.fieldId,
                daveId: req.body.daveId,
            });

            newFieldName
                .save()
                .then(fieldname => res.json(fieldname))
                .catch(err => res.json(err));
});
module.exports = router;