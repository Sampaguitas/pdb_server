const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

            const newSub = new Sub({
                vlDelDateExp: req.body.vlDelDateExp,
                vlDelDateAct: req.body.vlDelDateAct,
                supReadyDateExp: req.body.supReadyDateExp,
                supReadyDateAct: req.body.supReadyDateAct,
                supDelDateExp: req.body.supDelDateExp,
                supDelDateAct: req.body.supDelDateAct,
                nfiDateExp: req.body.nfiDateExp,
                nfiDateAct: req.body.nfiDateAct,
                rfiDateExp: req.body.rfiDateExp,
                rfiDateAct: req.body.rfiDateAct,
                inspRelDate: req.body.inspRelDate,
                rfsDateExp: req.body.rfsDateExp,
                rfsDateAct: req.body.rfsDateAct,
                shipDateExp: req.body.shipDateExp,
                shipDateAct: req.body.shipDateAct,
                shipDocSent: req.body.shipDocSent,
                etaDate: req.body.etaDate,
                rfiQty: req.body.rfiQty,
                inspQty: req.body.inspQty,
                relQty: req.body.relQty,
                shippedQty: req.body.shippedQty,
                splitQty: req.body.splitQty,
                nfi: req.body.nfi,
                heatNr: req.body.heatNr,
                manufacturer: req.body.manufacturer,
                manufOrigin: req.body.manufOrigin,
                inspector: req.body.inspector,
                delivery: req.body.delivery,
                transport: req.body.transport,
                transportPos: req.body.transportPos,
                destination: req.body.destination,
                commentsExp: req.body.commentsExp,
                commentsInsp: req.body.commentsInsp,
                commentsLog: req.body.commentsLog,
                intComments: req.body.intComments,
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
                projectId: req.body.projectId,
                poId: req.body.poId,
                daveId: req.body.daveId,
            });

            newSub
                .save()
                .then(sub => res.json(sub))
                .catch(err => res.json(err));

});
module.exports = router;