const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');

const DocCountEsr = require('../../models/DocCountEsr');
const DocCountInspect = require('../../models/DocCountInspect');
const DocCountInsprel = require('../../models/DocCountInsprel');
const DocCountNfi = require('../../models/DocCountNfi');
const DocCountPf = require('../../models/DocCountPf');
const DocCountPl = require('../../models/DocCountPl');
const DocCountPn = require('../../models/DocCountPn');
const DocCountSi = require('../../models/DocCountSi');
const DocCountSm = require('../../models/DocCountSm');

const fault = require('../../utilities/Errors');

router.post('/', async (req, res) => {
    console.log('req.body:', req.body);
    if (req.body.code) {
            const newDocDef = new DocDef({
                // _id: req.body._id,
                code: req.body.code,
                location: req.body.location,
                field: req.body.field,
                description: req.body.description,
                row1: req.body.row1,
                col1: req.body.col1,
                grid: req.body.grid,
                worksheet1: req.body.worksheet1, //req.body.detail && req.body.doctypeId == '5d1927131424114e3884ac80' &&
                worksheet2: req.body.worksheet2,
                row2: req.body.row2,
                col2: req.body.col2,
                doctypeId: req.body.doctypeId,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });
            newDocDef
                .save()
                .then(docdef => res.json(docdef))
                .catch(err => res.json(err));
    } else {
            const newDocDef = new DocDef({
                // _id: req.body._id,
                code: getDocDefCode(req.body.projectId,req.body.doctypeId),
                location: req.body.location,
                field: req.body.field,
                description: req.body.description,
                row1: req.body.row1,
                col1: req.body.col1,
                grid: req.body.grid,
                worksheet1: req.body.worksheet1, //req.body.detail && req.body.doctypeId == '5d1927131424114e3884ac80' &&
                worksheet2: req.body.worksheet2,
                row2: req.body.row2,
                col2: req.body.col2,
                doctypeId: req.body.doctypeId,
                projectId: req.body.projectId,
                daveId: req.body.daveId,
            });
            newDocDef
                .save()
                .then(docdef => res.json(docdef))
                .catch(err => res.json(err));
    }
});

function baseTen(number) {
    return number.toString().length > 2 ? number : '0' + number;
}

function getDocDefCode(projectId, doctypeId) {
    switch(doctypeId){
        case '5d1927121424114e3884ac7e': //ESR01
            return DocCountEsr.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountesr)   {
                if(error) {
                    return 'ESR00';
                } else if (!doccountesr) {
                    return 'ESR00';
                } else {
                    return String('ESR' + baseTen(doccountesr.seq));
                } 
            });
            break;
        case '5d1927131424114e3884ac7f': //NFI01
            return DocCountNfi.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountnfi)   {
                if(error) {
                    return 'NFI00';
                } else if (!doccountnfi) {
                    return 'NFI00';
                } else {
                    return 'NFI' + baseTen(doccountnfi.seq);
                } 
            });
            break;
        case '5d1927131424114e3884ac80': //PL01
            return DocCountPl.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountpl)   {
                if(error) {
                    return 'PL00';
                } else if (!doccountpl) {
                    return 'PL00';
                } else {
                    return 'PL' + baseTen(doccountpl.seq);
                }
            });
            break; 
        case '5d1927131424114e3884ac81': //PN01
            return DocCountPn.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountpn)   {
                if(error) {
                    return 'PN00';
                } else if (!doccountpn) {
                    return 'PN00';
                } else {
                    return 'PN' + baseTen(doccountpn.seq);
                }
            });
            break;
        case '5d1927141424114e3884ac82': //PF01
            return DocCountPf.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountpf)   {
                if(error) {
                    return 'PF00';
                } else if (!doccountpf) {
                    return 'PF00';
                } else {
                    return 'PF' + baseTen(doccountpf.seq);
                }
            });
            break;
        case '5d1927141424114e3884ac83': //SI01
            return DocCountSi.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountsi)   {
                if(error) {
                    return 'SI00';
                } else if (!doccountsi) {
                    return 'SI00';
                } else {
                    return 'SI' + baseTen(doccountsi.seq);
                }
            });
            break;
        case '5d1927141424114e3884ac84': //SM01
            return DocCountSm.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, doccountsm)   {
                if(error) {
                    return 'SM00';
                } else if (!doccountsm) {
                    return 'SM00';
                } else {
                    return 'SM' + baseTen(doccountsm.seq);
                }
            });
            break;
        case '5d1928de1424114e3884ac85': //INSPECT01
            return DocCountInspect.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, function(error, Docountinspect)   {
                if(error) {
                    return 'INSPECT00';
                } else if (!Docountinspect) {
                    return 'INSPECT00';
                } else {
                    return 'INSPECT' + baseTen(Docountinspect.seq);
                }
            });
            break;
        case '5d1928de1424114e3884ac86': //ESR00
            return DocCountEsr.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
                if(error) {
                    return 'ESR00';
                } else if (!counter) {
                    return 'ESR00';
                } else {
                    return 'ESR' + baseTen(counter.seq);
                }
            });
            break;
        case '5d1928df1424114e3884ac87': //INSPREL01
            return DocCountInsprel.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
                if(error) {
                    return 'INSPREL00';
                } else if (!counter) {
                    return 'INSPREL00';
                } else {
                    return 'INSPREL' + baseTen(counter.seq);
                }
            });
            break;
        default: return '0';
    }
}

module.exports = router;