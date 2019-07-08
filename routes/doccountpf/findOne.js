const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountPf.findById(id, function (err, doccountpf) {
            if (!doccountpf) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountPf does not exist",
                });
            }
            else {
                return res.json(doccountpf);
            }
        });
});

module.exports = router;