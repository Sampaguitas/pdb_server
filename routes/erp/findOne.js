const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Erp.findById(id, function (err, erp) {
        if (!erp) {
            return res.status(404).json({
                message: fault(0601).message
                //"0601": "Erp does not exist",
            });
        }
        else {
            return res.json(erp);
        }
    });
});


module.exports = router;
