const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Article.findByIdAndUpdate(id, { $set: data }, function (err, article) {
        if (!article) {
            return res.status(400).json({
                message: fault(0101).message
                //"0101": "Article does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0102).message
                //"0102": "Article has been updated",
            });
        }
    });
});

module.exports = router;
