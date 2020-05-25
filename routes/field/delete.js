const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');

router.delete('/', (req, res) => {
    const id = req.query.id
    Field.findByIdAndDelete(id, function (err, field) {
        if (err) {
            return res.status(400).json({  message: 'An error has occured.' });
        } else if (!field) {
            return res.status(400).json({  message: 'Could not find Field.' });
        } else {
            return res.status(200).json({  message: 'Field has successfully been deleted.' });
        }
    });
});

module.exports = router;