const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    
    const id = req.query.id;
    console.log('data:', data);
    DocDef.findByIdAndUpdate(id, { $set: data }, function (err, docdef) {
        if (!docdef) {
            return res.status(400).json({
                message: 'DocDef does not exist'
                //"0401": "DocDef does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocDef has been updated'
                //"0402": "DocDef has been updated",
            });
        }
    });
});

module.exports = router;
