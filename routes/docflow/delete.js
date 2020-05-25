const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocFlow.findByIdAndDelete(id, function (err, docflow) {
        if (err) {
            return res.status(400).json({message: 'An error has occured.'});
        } else if (!docflow) {
            return res.status(400).json({ message: 'Could not find DocFlow.' });
        } else {
            return res.status(200).json({ message: 'DocFlow has successfully been deleted.' });
        }
    });
});

module.exports = router;