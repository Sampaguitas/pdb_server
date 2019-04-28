const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Locale.findById(id, function (err, locale) {
        if (!locale) {
            return res.status(404).json({
                message: fault(0901).message
                //"0901": "Locale does not exist",
            });
        }
        else {
            return res.json(locale);
        }
    });
});


module.exports = router;
