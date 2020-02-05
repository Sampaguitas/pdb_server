const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Article.findByIdAndUpdate(id, { $set: data }, function (err, article) {
        if (!article) {
            return res.status(400).json({
                message: 'Article does not exist'
                //"0101": "Article does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Article has been updated'
                //"0102": "Article has been updated",
            });
        }
    });
});

module.exports = router;
