const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Counter.findByIdAndRemove(id, function (err, counter) {
        if (!counter) {
            return res.status(400).json({
                message: 'Counter does not exist'
                //"1801": "Counter does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Counter has been deleted'
                //"1803": "Counter has been deleted",
            });
        }
    });
});

module.exports = router;