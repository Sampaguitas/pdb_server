const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Article.find(data, function (err, article) {
        if (!article) {
            return res.status(400).json({
                message: fault(0104).message
                //"0104": "No Article match",
            });
        }
        else {
            return res.json(article);
        }
    });
});

module.exports = router;