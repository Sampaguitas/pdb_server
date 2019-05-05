const express = require('express');
const router = express.Router();
const Article = require('../../models/Article');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newArticle = new Article({
                erp: req.body.erp,
                vlArtNo: req.body.vlArtNo,
                vlArtNoX: req.body.vlArtNoX,
                netWeight: req.body.netWeight,
                hsCode: req.body.hsCode,
                daveId: req.body.daveId,
            });

            newArticle
                .save()
                .then(article => res.json(article))
                .catch(err => res.json(err));
    //     }
    // });
});
module.exports = router;