const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Counter = require('../../models/Counter');
const Access = require('../../models/Access');
const Supplier = require('../../models/Supplier');
const Field = require('../../models/Field');
const FieldName = require('../../models/FieldName');
const DocDef = require('../../models/DocDef');
const DocField = require('../../models/DocField');

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
const fs = require('fs');
var path = require('path');
var s3bucket = require('../../middleware/s3bucket');

function projectUsers(users) {
    return users.filter(function(user) {
        return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
    });
}

router.post('/', (req, res) => {
    Project.findOne({ name: req.body.name }).then(project => {
        if (project) {
            return res.status(400).json({
                message: fault(1300).message
                //"1300": "Project already exists",
            });
        } else {
            const newProject = new Project({
                // _id: req.body._id,
                // number: req.body.number,
                name: req.body.name,
                erpId: req.body.erpId,
                currencyId: req.body.currencyId,
                opcoId: req.body.opcoId,
                daveId: req.body.daveId,
            });
            newProject
            .save()
            .then(project => {
                projectUsers(req.body.projectUsers).map(user => {
                    const newAccess = new Access({
                        isExpediting: user.isExpediting,
                        isInspection: user.isInspection,
                        isShipping: user.isShipping,
                        isWarehouse: user.isWarehouse,
                        isConfiguration: user.isConfiguration,
                        projectId: project._id,
                        userId: user.userId
                    });
                    newAccess.save();
                });
                Supplier.find({projectId: req.body.copyId}).then(suppliers =>{
                    suppliers.map(supplier => {
                        const newSupplier = new Supplier({
                            name: supplier.name,
                            registeredName: supplier.registeredName,
                            contact: supplier.contact,
                            position: supplier.position,
                            tel: supplier.tel,
                            fax: supplier.fax,
                            mail: supplier.mail,
                            address: supplier.address,
                            city: supplier.city,
                            country: supplier.country,
                            udfSpX1: supplier.udfSpX1,
                            udfSpX2: supplier.udfSpX2,
                            udfSpX3: supplier.udfSpX3,
                            udfSpX4: supplier.udfSpX4,
                            udfSpX5: supplier.udfSpX5,
                            udfSpX6: supplier.udfSpX6,
                            udfSpX7: supplier.udfSpX7,
                            udfSpX8: supplier.udfSpX8,
                            udfSpX9: supplier.udfSpX9,
                            udfSpX10: supplier.udfSpX10,
                            udfSp91: supplier.udfSp91,
                            udfSp92: supplier.udfSp92,
                            udfSp93: supplier.udfSp93,
                            udfSp94: supplier.udfSp94,
                            udfSp95: supplier.udfSp95,
                            udfSp96: supplier.udfSp96,
                            udfSp97: supplier.udfSp97,
                            udfSp98: supplier.udfSp98,
                            udfSp99: supplier.udfSp99,
                            udfSp910: supplier.udfSp910,
                            udfSpD1: supplier.udfSpD1,
                            udfSpD2: supplier.udfSpD2,
                            udfSpD3: supplier.udfSpD3,
                            udfSpD4: supplier.udfSpD4,
                            udfSpD5: supplier.udfSpD5,
                            udfSpD6: supplier.udfSpD6,
                            udfSpD7: supplier.udfSpD7,
                            udfSpD8: supplier.udfSpD8,
                            udfSpD9: supplier.udfSpD9,
                            udfSpD10: supplier.udfSpD10,
                            projectId: project._id
                        });
                        newSupplier.save();
                    });
                    DocDef.find({projectId: req.body.copyId}).then(ddfs => {
                        ddfs.map(ddf => {
                            const newDocDef = new DocDef({
                                code: ddf.code,
                                location: ddf.location,
                                field: ddf.field,
                                description: ddf.description,
                                row1: ddf.row1,
                                col1: ddf.col1,
                                grid: ddf.grid,
                                worksheet1: ddf.worksheet1,
                                worksheet2: ddf.worksheet2,
                                row2: ddf.row2,
                                col2: ddf.col2,
                                doctypeId: ddf.doctypeId,
                                projectId: project._id
                            });
                            newDocDef.save();
                        });
                        Field.find({projectId: req.body.copyId}).then(flds => {
                            flds.map(fld => {
                                const newField = new Field({
                                    name: fld.name,
                                    custom: fld.custom,
                                    type: fld.type,
                                    fromTbl: fld.fromTbl,
                                    projectId: project._id
                                });
                                newField
                                .save()
                                .then(field => {
                                    FieldName.find({fieldId: fld._id}).then(fldNs => {
                                        fldNs.map(fldN => {
                                            const newFieldName = new FieldName({
                                                align: fldN.align,
                                                edit: fldN.edit,
                                                forSelect: fldN.forSelect,
                                                forShow: fldN.forShow,
                                                screenId: fldN.screenId,
                                                fieldId: field._id,
                                                projectId: project._id
                                            });
                                            newFieldName
                                            .save();
                                        });
                                        DocField.find({fieldId: fld._id}).then(dflds =>{
                                            dflds.map( dfld => {
                                                DocDef.findOne({ _id: dfld.docdefId}).then(odd => {
                                                    DocDef.findOne({code: odd.code, projectId: project._id}).then(ndd =>{
                                                        const newDocField = new DocField({
                                                            location: dfld.location,
                                                            row: dfld.row,
                                                            col: dfld.col,
                                                            grid: dfld.grid,
                                                            param: dfld.param,
                                                            worksheet: dfld.worksheet,
                                                            docdefId: ndd._id,
                                                            fieldId: field._id,
                                                            projectId: project._id
                                                        });
                                                        newDocField.save();
                                                    });
                                                });
                                            }); //map                                                                                           
                                        });
                                    });
                                });
                            }); //map
                            DocCountEsr.findOne({_id: req.body.copyId}).then(oldDocCountEsr => {
                                const newDocCountEsr = new DocCountEsr({
                                   _id:  project._id,
                                   seq: oldDocCountEsr.seq
                                });
                                newDocCountEsr.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountInspect.findOne({_id: req.body.copyId}).then(oldDocCountInspect => {
                                const newDocCountInspect = new DocCountInspect({
                                   _id:  project._id,
                                   seq: oldDocCountInspect.seq
                                });
                                newDocCountInspect.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountInsprel.findOne({_id: req.body.copyId}).then(oldDocCountInsprel => {
                                const newDocCountInsprel = new DocCountInsprel({
                                   _id:  project._id,
                                   seq: oldDocCountInsprel.seq
                                });
                                newDocCountInsprel.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountNfi.findOne({_id: req.body.copyId}).then(oldDocCountNfi => {
                                const newDocCountNfi = new DocCountNfi({
                                   _id:  project._id,
                                   seq: oldDocCountNfi.seq
                                });
                                newDocCountNfi.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountPf.findOne({_id: req.body.copyId}).then(oldDocCountPf => {
                                const newDocCountPf = new DocCountPf({
                                   _id:  project._id,
                                   seq: oldDocCountPf.seq
                                });
                                newDocCountPf.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountPl.findOne({_id: req.body.copyId}).then(oldDocCountPl => {
                                const newDocCountPl = new DocCountPl({
                                   _id:  project._id,
                                   seq: oldDocCountPl.seq
                                });
                                newDocCountPl.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountPn.findOne({_id: req.body.copyId}).then(oldDocCountPn => {
                                const newDocCountPn = new DocCountPn({
                                   _id:  project._id,
                                   seq: oldDocCountPn.seq
                                });
                                newDocCountPn.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountSi.findOne({_id: req.body.copyId}).then(oldDocCountSi => {
                                const newDocCountSi = new DocCountSi({
                                   _id:  project._id,
                                   seq: oldDocCountSi.seq
                                });
                                newDocCountSi.save()
                            }).catch(err => res.status(400).json({ message: err}));
                            DocCountSm.findOne({_id: req.body.copyId}).then(oldDocCountSm => {
                                const newDocCountSm = new DocCountSm({
                                   _id:  project._id,
                                   seq: oldDocCountSm.seq
                                });
                                newDocCountSm.save()
                            }).catch(err => res.status(400).json({ message: err}));
                        }).catch(err => res.status(400).json({ message: err}));
                    });
                });
                Project.findOne({_id: req.body.copyId}).then(oldProject => {
                    s3bucket.duplicateProject(String(oldProject.number), String(project.number))
                    .then( () => res.json(project))
                    .catch(error => res.status(400).json({ message: error}));
                });
            }).catch(err => res.json(err));
        }
    });
});

module.exports = router;

