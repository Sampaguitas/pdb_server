const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Counter = require('../../models/Counter');
const Access = require('../../models/Access');
const Supplier = require('../../models/Supplier');
const Field = require('../../models/Field');
const FieldName = require('../../models/FieldName');
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
                                        newFieldName.save();
                                    });
                                });
                            }); 
                        });
                        Project.findOne({_id: req.body.copyId}).then(oldProject => {
                            s3bucket.duplicateProject(String(oldProject.number), String(project.number))
                            .then( () => res.json(project))
                            .catch(error => res.status(400).json({ message: error}));
                        });
                    });
                });   
            }).catch(err => res.json(err));
        }
    });
});

module.exports = router;