const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
            const newCertificate = new Certificate({
                cif: req.body.cif,
                heatNr: req.body.heatNr,
                udfCtX1: req.body.udfCtX1,
                udfCtX2: req.body.udfCtX2,
                udfCtX3: req.body.udfCtX3,
                udfCtX4: req.body.udfCtX4,
                udfCtX5: req.body.udfCtX5,
                udfCtX6: req.body.udfCtX6,
                udfCtX7: req.body.udfCtX7,
                udfCtX8: req.body.udfCtX8,
                udfCtX9: req.body.udfCtX9,
                udfCtX10: req.body.udfCtX10,
                udfCt91: req.body.udfCt91,
                udfCt92: req.body.udfCt92,
                udfCt93: req.body.udfCt93,
                udfCt94: req.body.udfCt94,
                udfCt95: req.body.udfCt95,
                udfCt96: req.body.udfCt96,
                udfCt97: req.body.udfCt97,
                udfCt98: req.body.udfCt98,
                udfCt99: req.body.udfCt99,
                udfCt910: req.body.udfCt910,
                udfCtD1: req.body.udfCtD1,
                udfCtD2: req.body.udfCtD2,
                udfCtD3: req.body.udfCtD3,
                udfCtD4: req.body.udfCtD4,
                udfCtD5: req.body.udfCtD5,
                udfCtD6: req.body.udfCtD6,
                udfCtD7: req.body.udfCtD7,
                udfCtD8: req.body.udfCtD8,
                udfCtD9: req.body.udfCtD9,
                udfCtD10: req.body.udfCtD10,
                subId: req.body.subId,
                daveId: req.body.daveId,
            });

            newCertificate
                .save()
                .then(certificate => res.json(certificate))
                .catch(err => res.json(err));
});
module.exports = router;