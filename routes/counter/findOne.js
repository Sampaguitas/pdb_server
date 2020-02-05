const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Counter.findById(id, function (err, counter) {
            if (!counter) {
                return res.status(400).json({
                    message: 'Counter does not exist'
                    //"1801": "Counter does not exist",
                });
            }
            else {
                return res.json(counter);
            }
        });
});

module.exports = router;