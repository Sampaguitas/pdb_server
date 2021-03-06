const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Erp.findOne({ name: req.body.name }).then(erp => {
        if (erp) {
            return res.status(400).json({
                message: fault(0600).message
                //"0600": "Erp already exists",
            });
        } else {

            const newErp = new Erp({
                name: req.body.name,
                articleField: req.body.articleField
            });

            newErp
                .save()
                .then(erp => res.json(erp))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;