const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newColliPack = new ColliPack({
                plNr: req.body.plNr,
                colliNr: req.body.colliNr,
                type: req.body.type,
                length: req.body.length,
                width: req.body.width,
                height: req.body.height,
                grossWeight: req.body.grossWeight,
                netWeight: req.body.netWeight,
                bundlesQty: req.body.bundlesQty,
                udfCpX1: req.body.udfCpX1,
                udfCpX2: req.body.udfCpX2,
                udfCpX3: req.body.udfCpX3,
                udfCpX4: req.body.udfCpX4,
                udfCpX5: req.body.udfCpX5,
                udfCpX6: req.body.udfCpX6,
                udfCpX7: req.body.udfCpX7,
                udfCpX8: req.body.udfCpX8,
                udfCpX9: req.body.udfCpX9,
                udfCpX10: req.body.udfCpX10,
                udfCp91: req.body.udfCp91,
                udfCp92: req.body.udfCp92,
                udfCp93: req.body.udfCp93,
                udfCp94: req.body.udfCp94,
                udfCp95: req.body.udfCp95,
                udfCp96: req.body.udfCp96,
                udfCp97: req.body.udfCp97,
                udfCp98: req.body.udfCp98,
                udfCp99: req.body.udfCp99,
                udfCp910: req.body.udfCp910,
                udfCpD1: req.body.udfCpD1,
                udfCpD2: req.body.udfCpD2,
                udfCpD3: req.body.udfCpD3,
                udfCpD4: req.body.udfCpD4,
                udfCpD5: req.body.udfCpD5,
                udfCpD6: req.body.udfCpD6,
                udfCpD7: req.body.udfCpD7,
                udfCpD8: req.body.udfCpD8,
                udfCpD9: req.body.udfCpD9,
                udfCpD10: req.body.udfCpD10,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });

            newColliPack
                .save()
                .then(collipack => res.json(collipack))
                .catch(err => res.json(err));
});
module.exports = router;