const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

            const newPackItem = new PackItem({
                plNr: req.body.plNr,
                colliNr: req.body.colliNr,
                mtrs: req.body.mtrs,
                pcs: req.body.pcs,
                mmt: req.body.mmt,
                plDate: req.body.plDate,
                invTaxNr: req.body.invTaxNr,
                invTaxDate: req.body.invTaxDate,
                invCustNr: req.body.invCustNr,
                invCustDate: req.body.invCustDate,
                udfPiX1: req.body.udfPiX1,
                udfPiX2: req.body.udfPiX2,
                udfPiX3: req.body.udfPiX3,
                udfPiX4: req.body.udfPiX4,
                udfPiX5: req.body.udfPiX5,
                udfPiX6: req.body.udfPiX6,
                udfPiX7: req.body.udfPiX7,
                udfPiX8: req.body.udfPiX8,
                udfPiX9: req.body.udfPiX9,
                udfPiX10: req.body.udfPiX10,
                udfPi91: req.body.udfPi91,
                udfPi92: req.body.udfPi92,
                udfPi93: req.body.udfPi93,
                udfPi94: req.body.udfPi94,
                udfPi95: req.body.udfPi95,
                udfPi96: req.body.udfPi96,
                udfPi97: req.body.udfPi97,
                udfPi98: req.body.udfPi98,
                udfPi99: req.body.udfPi99,
                udfPi910: req.body.udfPi910,
                udfPiD1: req.body.udfPiD1,
                udfPiD2: req.body.udfPiD2,
                udfPiD3: req.body.udfPiD3,
                udfPiD4: req.body.udfPiD4,
                udfPiD5: req.body.udfPiD5,
                udfPiD6: req.body.udfPiD6,
                udfPiD7: req.body.udfPiD7,
                udfPiD8: req.body.udfPiD8,
                udfPiD9: req.body.udfPiD9,
                udfPiD10: req.body.udfPiD10,
                subId: req.body.subId,
                packId: req.body.packedId,
                daveId: req.body.daveId,
            });

            newPackItem
                .save()
                .then(packitem => res.json(packitem))
                .catch(err => res.json(err));

});
module.exports = router;