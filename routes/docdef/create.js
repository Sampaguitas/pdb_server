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
const DocCountPt = require('../../models/DocCountPt');
const DocCountSi = require('../../models/DocCountSi');
const DocCountSm = require('../../models/DocCountSm');
const DocCountSh = require('../../models/DocCountSh');
const DocCountWhPl = require('../../models/DocCountWhPl');
const DocCountWhPn = require('../../models/DocCountWhPn');
const DocCountWhSi = require('../../models/DocCountWhSi');
const DocCountWhSm = require('../../models/DocCountWhSm');
const DocCountTr = require('../../models/DocCountTr');

router.post('/', async (req, res) => {

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
                .then( () => res.status(200).json({message: 'Docdef has successfully been created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured while creating docDef.'}));
    } else {
        getDocDefCode(req.body.projectId, req.body.doctypeId)
        .then(result => {
            const newDocDef = new DocDef({
                // _id: req.body._id,
                code: result,
                location: req.body.location,
                field: req.body.field,
                description: req.body.description,
                row1: req.body.row1,
                col1: req.body.col1,
                //grid: req.body.grid,
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
                .then( () => res.status(200).json({message: 'Docdef has successfully been created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured while creating docDef.'}));
        }).catch(err => res.status(400).json({message: err}))
    }
});

function baseTen(number) {
    return number.toString().length > 2 ? number : '0' + number;
}

function getDocDefCode(projectId, doctypeId) {
    switch(doctypeId){
        case '5d1927121424114e3884ac7e': //ESR01
            return new Promise(function(resolve, reject) {
                DocCountEsr.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('ESR' + baseTen(doc.seq));
                    }
                });
            })
        case '5d1927131424114e3884ac7f': //NFI01
            return new Promise(function(resolve, reject) {
                DocCountNfi.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('NFI' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1927131424114e3884ac80': //PL01
            return new Promise(function(resolve, reject) {
                DocCountPl.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('PL' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1927131424114e3884ac81': //PN01
            return new Promise(function(resolve, reject) {
                DocCountPn.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('PN' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1927141424114e3884ac82': //PF01
            return new Promise(function(resolve, reject) {
                DocCountPf.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('PF' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1927141424114e3884ac83': //SI01
            return new Promise(function(resolve, reject) {
                DocCountSi.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('SI' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1927141424114e3884ac84': //SM01
            return new Promise(function(resolve, reject) {
                DocCountSm.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('SM' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1928de1424114e3884ac85': //INSPECT01
            return new Promise(function(resolve, reject) {
                DocCountInspect.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('INSPECT' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1928de1424114e3884ac86': //ESR00
            return new Promise(function(resolve, reject) {
                DocCountEsr.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('ESR' + baseTen(doc.seq));
                    }
                });
            });
        case '5d1928df1424114e3884ac87': //INSPREL01
            return new Promise(function(resolve, reject) {
                DocCountInsprel.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('INSPREL' + baseTen(doc.seq));
                    }
                });
            });
        case '5eacef91e7179a42f172feea': //SH01
            return new Promise(function(resolve, reject) {
                DocCountSh.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('SH' + baseTen(doc.seq));
                    }
                });
            });
        case '5edb2317e7179a6b6367d786': //PT01
            return new Promise(function(resolve, reject) {
                DocCountPt.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('PT' + baseTen(doc.seq));
                    }
                });
            });
        case '5ef4e9a67c213e6263a723f0': //WHPL01
            return new Promise(function(resolve, reject) {
                DocCountWhPl.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('WHPL' + baseTen(doc.seq));
                    }
                });
            });
        case '5ef4e9d67c213e6263a7240e': //WHPN01
            return new Promise(function(resolve, reject) {
                DocCountWhPn.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('WHPN' + baseTen(doc.seq));
                    }
                });
            });
        case '5ef4ea197c213e6263a7241b': //WHSI01
            return new Promise(function(resolve, reject) {
                DocCountWhSi.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('WHSI' + baseTen(doc.seq));
                    }
                });
            });
        case '5ef4ea597c213e6263a72425': //WHSM01
            return new Promise(function(resolve, reject) {
                DocCountWhSm.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('WHSM' + baseTen(doc.seq));
                    }
                });
            });
        case '6076c553827af545d02057e3': //TR01
            return new Promise(function(resolve, reject) {
                DocCountTr.findOneAndUpdate({_id: projectId}, {$inc: { seq: 1} }, {new: true, upsert: true }, function(error, doc)   {
                    if(error) {
                        reject('An error has occured.');
                    } else if (!doc) {
                        reject('No document was return from the callback.');
                    } else {
                        resolve('TR' + baseTen(doc.seq));
                    }
                });
            });
        default: return new Promise(function(resolve, reject) {
            reject('DocType not listed.');
        });
    }
}

module.exports = router;