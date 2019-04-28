const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Erp.findByIdAndRemove(id, function (err, erp) {
        if (!erp) {
            return res.status(400).json({
                message: fault(0601).message
                //"0601": "Erp does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0603).message,
                //"0603": "Erp has been deleted",
            });
        }
    });
});

module.exports = router;