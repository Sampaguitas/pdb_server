const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const NewDocFlow = new DocFlow({
                predecessor: req.body.predecessor,
                predecessorPos: req.body.predecessorPos,
                predecessorType: req.body.predecessorType,
                daveId: req.body.daveId,
            });

            NewDocFlow
                .save()
                .then(docflow => res.json(docflow))
                .catch(err => res.json(err));
});
module.exports = router;