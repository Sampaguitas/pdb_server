const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');

router.delete('/', (req, res) => {
    const id = req.query.id
    Article.findByIdAndDelete(id, function (err, article) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!article) {
            return res.status(400).json({ message: 'Could not find Article.' });
        } else {
            return res.status(200).json({ message: 'Article has successfully been deleted.' });
        }
    });
});

module.exports = router;