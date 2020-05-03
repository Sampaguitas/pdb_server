const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSh.findByIdAndRemove(id, function (err, doccountsh) {
        if (err || !doccountsh) {
            return res.status(400).json({ message: 'DocCountSh could not be deleted' });
        } else {
            return res.status(200).json({ message: 'DocCountSh has been deleted' });
        }
    });
});

module.exports = router;