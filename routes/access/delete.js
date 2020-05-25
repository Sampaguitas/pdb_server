const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');

router.delete('/', (req, res) => {
    const id = req.query.id
    Access.findByIdAndDelete(id, function (err, access) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!access) {
            return res.status(400).json({ message: 'Could not delete Access.' });
        } else {
            return res.status(200).json({ message: 'Access has successfully been deleted' });
        }
    });
});

module.exports = router;