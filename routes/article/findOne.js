const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Article.findById(id, function (err, article) {
        if (!article) {
            return res.status(404).json({
                message: 'Article does not exist'
                //"0101": "Article does not exist",
            });
        }
        else {
            return res.json(article);
        }
    });
});


module.exports = router;
