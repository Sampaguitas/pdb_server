const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Article.findOne({ vlArtNo: req.body.vlArtNo }).then(article => {
        if (article) {
            return res.status(400).json({
                message: fault(0100).message
                //"0100": "Article already exists",
            });
        } else {

            const newArticle = new Article({
                vlArtNo: req.body.vlArtNo,
                netWeight: req.body.netWeight,
                hsCode: req.body.hsCode,
                vlArtNoX: req.body.vlArtNoX,
                erp: req.body.erp,
            });

            newArticle
                .save()
                .then(article => res.json(article))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;