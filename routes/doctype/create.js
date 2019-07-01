const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newDocType = new DocType({
                code: req.body.code,
                name: req.body.name,
            });

            newDocType
                .save()
                .then(doctype => res.json(doctype))
                .catch(err => res.json(err));
});
module.exports = router;