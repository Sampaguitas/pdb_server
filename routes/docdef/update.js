const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    
    const id = req.query.id;
    DocDef.findByIdAndUpdate(id, { $set: data }, function (err, docdef) {
        if (!docdef) {
            return res.status(400).json({ message: 'DocDef does not exist' });
        }
        else {
            return res.status(200).json({ message: 'DocDef has been updated' });
        }
    });
});

module.exports = router;
