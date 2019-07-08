const express = require('express');
const router = express.Router();
const DocCountPn = require('../../models/DocCountPn');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountPn.findById(id, function (err, doccountpn) {
            if (!doccountpn) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountPn does not exist",
                });
            }
            else {
                return res.json(doccountpn);
            }
        });
});

module.exports = router;