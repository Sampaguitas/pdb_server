const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

            const newSub = new Sub({
                vlDelDateExp: req.body.vlDelDateExp,
                supDelDateAct: req.body.supDelDateAct,
                supDelDateExp: req.body.supDelDateExp,
                rfiDateExp: req.body.rfiDateExp,
                rfiDateAct: req.body.rfiDateAct,
                inspRelDate: req.body.inspRelDate,
                rfiQty: req.body.rfiQty,
                inspQty: req.body.inspQty,
                relQty: req.body.relQty,
                inspector: req.body.inspector,
                rfsDateExp: req.body.rfsDateExp,
                rfsDateAct: req.body.rfsDateAct,
                shipDateAct: req.body.shipDateAct,
                etaDate: req.body.etaDate,
                shippedQty: req.body.shippedQty,
                intComments: req.body.intComments,
                nfi: req.body.nfi,
                heatNr: req.body.heatNr,
                nfiDateExp: req.body.nfiDateExp,
                destination: req.body.destination,
                manufacturer: req.body.manufacturer,
                manufOrigin: req.body.manufOrigin,
                udfSbX1: req.body.udfSbX1,
                udfSbX2: req.body.udfSbX2,
                udfSbX3: req.body.udfSbX3,
                udfSbX4: req.body.udfSbX4,
                udfSbX5: req.body.udfSbX5,
                udfSbX6: req.body.udfSbX6,
                udfSbX7: req.body.udfSbX7,
                udfSbX8: req.body.udfSbX8,
                udfSbX9: req.body.udfSbX9,
                udfSbX10: req.body.udfSbX10,
                udfSb91: req.body.udfSb91,
                udfSb92: req.body.udfSb92,
                udfSb93: req.body.udfSb93,
                udfSb94: req.body.udfSb94,
                udfSb95: req.body.udfSb95,
                udfSb96: req.body.udfSb96,
                udfSb97: req.body.udfSb97,
                udfSb98: req.body.udfSb98,
                udfSb99: req.body.udfSb99,
                udfSb910: req.body.udfSb910,
                udfSbD1: req.body.udfSbD1,
                udfSbD2: req.body.udfSbD2,
                udfSbD3: req.body.udfSbD3,
                udfSbD4: req.body.udfSbD4,
                udfSbD5: req.body.udfSbD5,
                udfSbD6: req.body.udfSbD6,
                udfSbD7: req.body.udfSbD7,
                udfSbD8: req.body.udfSbD8,
                udfSbD9: req.body.udfSbD9,
                udfSbD10: req.body.udfSbD10,
                supReadyDateExp: req.body.supReadyDateExp,
                supReadyDateAct: req.body.supReadyDateAct,
                shipDocSent: req.body.shipDocSent,
                shipDateExp: req.body.shipDateExp,
                vlDelDateAct: req.body.vlDelDateAct,
                commentsExp: req.body.commentsExp,
                commentsInsp: req.body.commentsInsp,
                commentsLog: req.body.commentsLog,
                splitQty: req.body.splitQty,
                delivery: req.body.delivery,
                transport: req.body.transport,
                transportPos: req.body.transportPos,
                project: req.body.project,
                po: req.body.po,
                
            });

            newSub
                .save()
                .then(sub => res.json(sub))
                .catch(err => res.json(err));

});
module.exports = router;