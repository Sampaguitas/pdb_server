const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocDef.findByIdAndDelete(id, function (err, docdef) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!docdef) {
            return res.status(400).json({ message: 'Could not find DocDef.'});
        } else {
            return res.status(200).json({ message: 'DocDef has successfully been deleted.'});
        }
    });
});

module.exports = router;