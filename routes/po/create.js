const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

            const newPo = new Po({
                clPo: req.body.clPo,
                clPoRev: req.body.clPoRev,
                clPoItem: req.body.clPoItem,
                clCode: req.body.clCode,
                qty: req.body.qty,
                uom: req.body.uom,
                size: req.body.size,
                sch: req.body.sch,
                description: req.body.description,
                material: req.body.material,
                remarks: req.body.remarks,
                unitPrice: req.body.unitPrice,
                vlContDelDate: req.body.vlContDelDate,
                kind: req.body.kind,
                vlSo: req.body.vlSo,
                vlSoItem: req.body.vlSoItem,
                vlPo: req.body.vlPo,
                vlPoItem: req.body.vlPoItem,
                supplier: req.body.supplier,
                supSo: req.body.supSo,
                supSoItem: req.body.supSoItem,
                supcontrDate: req.body.supcontrDate,
                comments: req.body.comments,
                vlDelCondition: req.body.vlDelCondition,
                supDelCondition: req.body.supDelCondition,
                devRemarks: req.body.devRemarks,
                clDescription: req.body.clDescription,
                s1: req.body.s1,
                s2: req.body.s2,
                dn1: req.body.dn1,
                dn2: req.body.dn2,
                vlArtNoX: req.body.vlArtNoX,
                itemX: req.body.itemX,
                vlPoX: req.body.vlPoX,
                vlPoItemX: req.body.vlPoItemX,
                udfPoX1: req.body.udfPoX1,
                udfPoX2: req.body.udfPoX2,
                udfPoX3: req.body.udfPoX3,
                udfPoX4: req.body.udfPoX4,
                udfPoX5: req.body.udfPoX5,
                udfPoX6: req.body.udfPoX6,
                udfPoX7: req.body.udfPoX7,
                udfPoX8: req.body.udfPoX8,
                udfPoX9: req.body.udfPoX9,
                udfPoX10: req.body.udfPoX10,
                udfPo91: req.body.udfPo91,
                udfPo92: req.body.udfPo92,
                udfPo93: req.body.udfPo93,
                udfPo94: req.body.udfPo94,
                udfPo95: req.body.udfPo95,
                udfPo96: req.body.udfPo96,
                udfPo97: req.body.udfPo97,
                udfPo98: req.body.udfPo98,
                udfPo99: req.body.udfPo99,
                udfPo910: req.body.udfPo910,
                udfPoD1: req.body.udfPoD1,
                udfPoD2: req.body.udfPoD2,
                udfPoD3: req.body.udfPoD3,
                udfPoD4: req.body.udfPoD4,
                udfPoD5: req.body.udfPoD5,
                udfPoD6: req.body.udfPoD6,
                udfPoD7: req.body.udfPoD7,
                udfPoD8: req.body.udfPoD8,
                udfPoD9: req.body.udfPoD9,
                udfPoD10: req.body.udfPoD10,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });

            newPo
                .save()
                .then(po => res.json(po))
                .catch(err => res.json(err));

});
module.exports = router;