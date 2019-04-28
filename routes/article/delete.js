const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Article.findByIdAndRemove(id, function (err, article) {
        if (!article) {
            return res.status(400).json({
                message: fault(0101).message
                //"0101": "Article does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0103).message,
                //"0103": "Article has been deleted",
            });
        }
    });
});

module.exports = router;