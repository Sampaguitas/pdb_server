const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newColliType = new ColliType({
                type: req.body.type,
                length: req.body.length,
                width: req.body.width,
                height: req.body.height,
                pkWeight: req.body.pkWeight,
                project: req.body.project,
            });

            newColliType
                .save()
                .then(collitype => res.json(collitype))
                .catch(err => res.json(err));
});
module.exports = router;