const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.delete('/', (req, res) => {
    const id = req.query.id
    Heat.findByIdAndRemove(id, function (err) {
        if (err) {
            return res.status(400).json({ message: 'Heat could not be deleted.' });
        }
        else {
            return res.status(200).json({ message: 'Heat has been deleted' });
        }
    });
});

module.exports = router;