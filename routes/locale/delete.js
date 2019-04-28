const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Locale.findByIdAndRemove(id, function (err, locale) {
        if (!locale) {
            return res.status(400).json({
                message: fault(0901).message
                //"0901": "Locale does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0903).message,
                //"0903": "Locale has been deleted",
            });
        }
    });
});

module.exports = router;