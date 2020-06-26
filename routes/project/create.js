const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Counter = require('../../models/Counter');
const Access = require('../../models/Access');
const ColliType = require('../../models/ColliType');
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
const DocCountPt = require('../../models/DocCountPt');
const DocCountSh = require('../../models/DocCountSh');
const DocCountSi = require('../../models/DocCountSi');
const DocCountSm = require('../../models/DocCountSm');
const DocCountWhPl = require('../../models/DocCountWhPl');
const DocCountWhPn = require('../../models/DocCountWhPn');
const DocCountWhSi = require('../../models/DocCountWhSi');
const DocCountWhSm = require('../../models/DocCountWhSm');

const fault = require('../../utilities/Errors');
const fs = require('fs');
var path = require('path');
var s3bucket = require('../../middleware/s3bucket');

function projectUsers(users) {
    return users.filter(function(user) {
        return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
    });
}

router.post('/', async (req, res) => {

    let sameNameProject = await Project.findOne({ name: req.body.name });
    if (sameNameProject) {
        return res.status(400).json({message: fault(1300).message}); //"1300": "Project already exists",
    } else {

        const newProject = new Project({
            name: req.body.name,
            enableInspection: req.body.enableInspection,
            enableShipping: req.body.enableShipping,
            enableWarehouse: req.body.enableWarehouse,
            erpId: req.body.erpId,
            currencyId: req.body.currencyId,
            opcoId: req.body.opcoId,
            daveId: req.body.daveId,
        });
        newProject
        .save()
        .then(async project => {
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
                newAccess
                .save()
                .then( () => console.log("new Access has been created"))
                .catch( () => console.log("access could not be created"));
            });

            let oldSuppliers = await Supplier.find({projectId: req.body.copyId});
            if (!oldSuppliers) {
                return console.log("there was no supplier");
            } else {
                oldSuppliers.map(oldSupplier => {
                    const newSupplier = new Supplier({
                        name: oldSupplier.name,
                        registeredName: oldSupplier.registeredName,
                        contact: oldSupplier.contact,
                        position: oldSupplier.position,
                        tel: oldSupplier.tel,
                        fax: oldSupplier.fax,
                        mail: oldSupplier.mail,
                        address: oldSupplier.address,
                        city: oldSupplier.city,
                        country: oldSupplier.country,
                        udfSpX1: oldSupplier.udfSpX1,
                        udfSpX2: oldSupplier.udfSpX2,
                        udfSpX3: oldSupplier.udfSpX3,
                        udfSpX4: oldSupplier.udfSpX4,
                        udfSpX5: oldSupplier.udfSpX5,
                        udfSpX6: oldSupplier.udfSpX6,
                        udfSpX7: oldSupplier.udfSpX7,
                        udfSpX8: oldSupplier.udfSpX8,
                        udfSpX9: oldSupplier.udfSpX9,
                        udfSpX10: oldSupplier.udfSpX10,
                        udfSp91: oldSupplier.udfSp91,
                        udfSp92: oldSupplier.udfSp92,
                        udfSp93: oldSupplier.udfSp93,
                        udfSp94: oldSupplier.udfSp94,
                        udfSp95: oldSupplier.udfSp95,
                        udfSp96: oldSupplier.udfSp96,
                        udfSp97: oldSupplier.udfSp97,
                        udfSp98: oldSupplier.udfSp98,
                        udfSp99: oldSupplier.udfSp99,
                        udfSp910: oldSupplier.udfSp910,
                        udfSpD1: oldSupplier.udfSpD1,
                        udfSpD2: oldSupplier.udfSpD2,
                        udfSpD3: oldSupplier.udfSpD3,
                        udfSpD4: oldSupplier.udfSpD4,
                        udfSpD5: oldSupplier.udfSpD5,
                        udfSpD6: oldSupplier.udfSpD6,
                        udfSpD7: oldSupplier.udfSpD7,
                        udfSpD8: oldSupplier.udfSpD8,
                        udfSpD9: oldSupplier.udfSpD9,
                        udfSpD10: oldSupplier.udfSpD10,
                        projectId: project._id
                    });
                    newSupplier
                    .save()
                    .then( () => console.log("new Supplier has been created"))
                    .catch( () => console.log("Supplier could not be created"));
                }); //map
            } //if statement

            let oldColliTypes = await ColliType.find({projectId: req.body.copyId});
            if(!oldColliTypes) {
                return console.log("there was no old ColliType");
            } else {
                oldColliTypes.map(oldColliType => {
                    const newColliType = new ColliType({
                        type: oldColliType.type,
                        length: oldColliType.length,
                        width: oldColliType.width,
                        height: oldColliType.height,
                        pkWeight: oldColliType.pkWeight,
                        projectId: oldColliType.projectId
                    });
                    newColliType.save()
                    .then(console.log("new ColliType has been created"))
                    .catch( () => console.log("ColliType could not be created"));
                });
            }

            let oldDocDefs = await DocDef.find({projectId: req.body.copyId});
            if(!oldDocDefs) {
                return console.log("there was no old DocDef");   
            } else {
                oldDocDefs.map(oldDocDef => {
                    const newDocDef = new DocDef({
                        code: oldDocDef.code,
                        location: oldDocDef.location,
                        field: oldDocDef.field,
                        description: oldDocDef.description,
                        row1: oldDocDef.row1,
                        col1: oldDocDef.col1,
                        grid: oldDocDef.grid,
                        worksheet1: oldDocDef.worksheet1,
                        worksheet2: oldDocDef.worksheet2,
                        row2: oldDocDef.row2,
                        col2: oldDocDef.col2,
                        doctypeId: oldDocDef.doctypeId,
                        projectId: project._id
                    });
                    newDocDef
                    .save()
                    .then(console.log("new DocDef has been created"))
                    .catch( () => console.log("DocDef could not be created"));
                }); //map
                
                let oldFields = await Field.find({projectId: req.body.copyId});
                if(!oldFields) {
                    return console.log("there was no Field");    
                } else {
                    oldFields.map(oldField => {
                        const newField = new Field({
                            name: oldField.name,
                            custom: oldField.custom,
                            type: oldField.type,
                            fromTbl: oldField.fromTbl,
                            projectId: project._id
                        });
                        newField
                        .save()
                        .then(console.log("new Field has been created"))
                        .then( createdField => {
                            FieldName.find({fieldId: oldField._id}, function(err, oldFieldNames) {
                                if (err) {
                                    return console.log(err);
                                } else if (!oldFieldNames){
                                    return console.log("there was no matching FieldName");
                                } else {
                                    oldFieldNames.map(oldFieldName => {
                                        const newFieldName = new FieldName({
                                            align: oldFieldName.align,
                                            edit: oldFieldName.edit,
                                            forSelect: oldFieldName.forSelect,
                                            forShow: oldFieldName.forShow,
                                            screenId: oldFieldName.screenId,
                                            fieldId: createdField._id,
                                            projectId: project._id
                                        });
                                        newFieldName
                                        .save()
                                        .then( () => console.log("new FieldName has been created"))
                                        .catch( () => console.log("FieldName could not be created"));
                                    }); //map
                                } //if statement
                                
                                DocField.find({fieldId: oldField._id}, function (err, oldDocFields) {
                                    if (err) {
                                        return console.log(err); 
                                    } else if (!oldDocFields) {
                                        return console.log("there was no matching DocField");
                                    } else {
                                        oldDocFields.map(oldDocField => {
                                            DocDef.findOne({ _id: oldDocField.docdefId}, function (err, oldParentDocDef) {
                                                if (err) {
                                                    return console.log(err);
                                                } else if (!oldParentDocDef) {
                                                    return console.log("could not find the old Parent DocDef");
                                                } else {
                                                    DocDef.findOne({code: oldParentDocDef.code, projectId: project._id}, function (err, newParentDocDef) {
                                                        if (err) {
                                                            return console.log(err);
                                                        } else if (!newParentDocDef) {
                                                            return console.log("could not find the new Parent DocDef");
                                                        } else {
                                                            const newDocField = new DocField({
                                                                location: oldDocField.location,
                                                                row: oldDocField.row,
                                                                col: oldDocField.col,
                                                                grid: oldDocField.grid,
                                                                param: oldDocField.param,
                                                                worksheet: oldDocField.worksheet,
                                                                docdefId: newParentDocDef._id,
                                                                fieldId: createdField._id,
                                                                projectId: project._id
                                                            });
                                                            newDocField
                                                            .save()
                                                            .then( () => console.log("new DocField has been created"))
                                                            .catch( () => console.log("DocField could not be created"));
                                                        } //if statement
                                                    }); // find fct callback
                                                } //if statement
                                            }); // find fct callback
                                        }); //map
                                    } //if statement
                                }); // find fct callback
                            }); // find fct callback
                        }).catch( () => console.log("Field could not be created"));
                    }); //map              
                } //if statement                


            } //if statement


            
            let oldDocCountEsr = await DocCountEsr.findOne({_id: req.body.copyId});
            if (!oldDocCountEsr) {
                return console.log("there was no oldDocCountEsr");
            } else {
                const newDocCountEsr = new DocCountEsr({
                    _id:  project._id,
                    seq: oldDocCountEsr.seq
                });
                newDocCountEsr
                .save()
                .then( () => console.log("new DocCountEsr has been created"))
                .catch( () => console.log("DocCountEsr could not be created"));
            } //if statement
            
            let oldDocCountInspect = await DocCountInspect.findOne({_id: req.body.copyId})
            if (!oldDocCountInspect) {
                return console.log("there was no oldDocCountInspect");
            } else {
                const newDocCountInspect = new DocCountInspect({
                    _id:  project._id,
                    seq: oldDocCountInspect.seq
                });
                newDocCountInspect
                .save()
                .then( () => console.log("new DocCountInspect has been created"))
                .catch( () => console.log("DocCountInspect could not be created"));
            } //if statement

            let oldDocCountInsprel = await DocCountInsprel.findOne({_id: req.body.copyId});
            if (!oldDocCountInsprel) {
                return console.log("there was no oldDocCountInsprel");
            } else {
                const newDocCountInsprel = new DocCountInsprel({
                    _id:  project._id,
                    seq: oldDocCountInsprel.seq
                });
                newDocCountInsprel
                .save()
                .then( () => console.log("new DocCountInsprel has been created"))
                .catch( () => console.log("DocCountInsprel could not be created"));
            } //if statement
            
            let oldDocCountNfi = await DocCountNfi.findOne({_id: req.body.copyId});
            if (!oldDocCountNfi) {
                return console.log("there was no oldDocCountNfi");
            } else {
                const newDocCountNfi = new DocCountNfi({
                    _id:  project._id,
                    seq: oldDocCountNfi.seq
                });
                newDocCountNfi
                .save()
                .then( () => console.log("new DocCountNfi has been created"))
                .catch( () => console.log("DocCountNfi could not be created"));
            } //if statement

            let oldDocCountPf = await DocCountPf.findOne({_id: req.body.copyId});
            if (!oldDocCountPf) {
                return console.log("there was no oldDocCountPf");
            } else {
                const newDocCountPf = new DocCountPf({
                    _id:  project._id,
                    seq: oldDocCountPf.seq
                });
                newDocCountPf
                .save()
                .then( () => console.log("new DocCountPf has been created"))
                .catch( () => console.log("DocCountPf could not be created"));
            } //if statement

            let oldDocCountPl = await DocCountPl.findOne({_id: req.body.copyId});
            if (!oldDocCountPl) {
                return console.log("there was no oldDocCountPl");
            } else {
                const newDocCountPl = new DocCountPl({
                    _id:  project._id,
                    seq: oldDocCountPl.seq
                });
                newDocCountPl
                .save()
                .then( () => console.log("new DocCountPl has been created"))
                .catch( () => console.log("DocCountPl could not be created"));
            } //if statement

            let oldDocCountPn = await DocCountPn.findOne({_id: req.body.copyId});
            if (!oldDocCountPn) {
                return console.log("there was no oldDocCountPn");
            } else {
                const newDocCountPn = new DocCountPn({
                    _id:  project._id,
                    seq: oldDocCountPn.seq
                });
                newDocCountPn
                .save()
                .then( () => console.log("new DocCountPn has been created"))
                .catch( () => console.log("DocCountPn could not be created"));
            } //if statement

            let oldDocCountPt = await DocCountPt.findOne({_id: req.body.copyId});
            if (!oldDocCountPt) {
                return console.log("there was no oldDocCountPt");
            } else {
                const newDocCountPt = new DocCountPt({
                    _id:  project._id,
                    seq: oldDocCountPt.seq
                });
                newDocCountPt
                .save()
                .then( () => console.log("new DocCountPt has been created"))
                .catch( () => console.log("DocCountPt could not be created"));
            } //if statement

            let oldDocCountSh = await DocCountSh.findOne({_id: req.body.copyId});
            if (!oldDocCountSh) {
                return console.log("there was no oldDocCountSh");
            } else {
                const newDocCountSh = new DocCountSh({
                    _id:  project._id,
                    seq: oldDocCountSh.seq
                });
                newDocCountSh
                .save()
                .then( () => console.log("new DocCountSh has been created"))
                .catch( () => console.log("DocCountSh could not be created"));
            } //if statement

            let oldDocCountSi = await DocCountSi.findOne({_id: req.body.copyId});
            if (!oldDocCountSi) {
                return console.log("there was no oldDocCountSi");
            } else {
                const newDocCountSi = new DocCountSi({
                    _id:  project._id,
                    seq: oldDocCountSi.seq
                });
                newDocCountSi
                .save()
                .then( () => console.log("new DocCountSi has been created"))
                .catch( () => console.log("DocCountSi could not be created"));
            } //if statement

            let oldDocCountSm = await DocCountSm.findOne({_id: req.body.copyId});
            if (!oldDocCountSm) {
                return console.log("there was no oldDocCountSm");
            } else {
                const newDocCountSm = new DocCountSm({
                    _id:  project._id,
                    seq: oldDocCountSm.seq
                });
                newDocCountSm
                .save()
                .then( () => console.log("new DocCountSm has been created"))
                .catch( () => console.log("DocCountSm could not be created"));
            } //if statement

            let oldDocCountWhPl = await DocCountWhPl.findOne({_id: req.body.copyId});
            if (!oldDocCountWhPl) {
                return console.log("there was no oldDocCountWhPl");
            } else {
                const newDocCountWhPl = new DocCountWhPl({
                    _id:  project._id,
                    seq: oldDocCountWhPl.seq
                });
                newDocCountWhPl
                .save()
                .then( () => console.log("new DocCountWhPl has been created"))
                .catch( () => console.log("DocCountWhPl could not be created"));
            } //if statement

            let oldDocCountWhPn = await DocCountWhPn.findOne({_id: req.body.copyId});
            if (!oldDocCountWhPn) {
                return console.log("there was no oldDocCountWhPn");
            } else {
                const newDocCountWhPn = new DocCountWhPn({
                    _id:  project._id,
                    seq: oldDocCountWhPn.seq
                });
                newDocCountWhPn
                .save()
                .then( () => console.log("new DocCountWhPn has been created"))
                .catch( () => console.log("DocCountWhPn could not be created"));
            } //if statement

            let oldDocCountWhSi = await DocCountWhSi.findOne({_id: req.body.copyId});
            if (!oldDocCountWhSi) {
                return console.log("there was no oldDocCountWhSi");
            } else {
                const newDocCountWhSi = new DocCountWhSi({
                    _id:  project._id,
                    seq: oldDocCountWhSi.seq
                });
                newDocCountWhSi
                .save()
                .then( () => console.log("new DocCountWhSi has been created"))
                .catch( () => console.log("DocCountWhSi could not be created"));
            } //if statement

            let oldDocCountWhSm = await DocCountWhSm.findOne({_id: req.body.copyId});
            if (!oldDocCountWhSm) {
                return console.log("there was no oldDocCountWhSm");
            } else {
                const newDocCountWhSm = new DocCountWhSm({
                    _id:  project._id,
                    seq: oldDocCountWhSm.seq
                });
                newDocCountWhSm
                .save()
                .then( () => console.log("new DocCountWhSm has been created"))
                .catch( () => console.log("DocCountWhSm could not be created"));
            } //if statement

            let oldProject = await Project.findOne({_id: req.body.copyId});
            if (!oldProject) {
                res.status(400).json({ message: "there was no oldProject"}); 
            } else {
                s3bucket.duplicateProject(String(oldProject.number), String(project.number))
                .then( () => res.json(project))
                .catch(error => res.status(400).json({ message: error}));
            } //if statement

        }).catch(errorProject => res.status(400).json({message: errorProject}));
    } //if statement
}); //Async fct

// router.post('/', (req, res) => {
//     Project.findOne({ name: req.body.name }).then(project => {
//         if (project) {
//             return res.status(400).json({
//                 message: fault(1300).message
//                 //"1300": "Project already exists",
//             });
//         } else {
//             const newProject = new Project({
//                 // _id: req.body._id,
//                 // number: req.body.number,
//                 name: req.body.name,
//                 erpId: req.body.erpId,
//                 currencyId: req.body.currencyId,
//                 opcoId: req.body.opcoId,
//                 daveId: req.body.daveId,
//             });
//             newProject
//             .save()
//             .then(project => {
//                 projectUsers(req.body.projectUsers).map(user => {
//                     const newAccess = new Access({
//                         isExpediting: user.isExpediting,
//                         isInspection: user.isInspection,
//                         isShipping: user.isShipping,
//                         isWarehouse: user.isWarehouse,
//                         isConfiguration: user.isConfiguration,
//                         projectId: project._id,
//                         userId: user.userId
//                     });
//                     newAccess.save();
//                 });
//                 Supplier.find({projectId: req.body.copyId}).then(suppliers =>{
//                     suppliers.map(supplier => {
//                         const newSupplier = new Supplier({
//                             name: supplier.name,
//                             registeredName: supplier.registeredName,
//                             contact: supplier.contact,
//                             position: supplier.position,
//                             tel: supplier.tel,
//                             fax: supplier.fax,
//                             mail: supplier.mail,
//                             address: supplier.address,
//                             city: supplier.city,
//                             country: supplier.country,
//                             udfSpX1: supplier.udfSpX1,
//                             udfSpX2: supplier.udfSpX2,
//                             udfSpX3: supplier.udfSpX3,
//                             udfSpX4: supplier.udfSpX4,
//                             udfSpX5: supplier.udfSpX5,
//                             udfSpX6: supplier.udfSpX6,
//                             udfSpX7: supplier.udfSpX7,
//                             udfSpX8: supplier.udfSpX8,
//                             udfSpX9: supplier.udfSpX9,
//                             udfSpX10: supplier.udfSpX10,
//                             udfSp91: supplier.udfSp91,
//                             udfSp92: supplier.udfSp92,
//                             udfSp93: supplier.udfSp93,
//                             udfSp94: supplier.udfSp94,
//                             udfSp95: supplier.udfSp95,
//                             udfSp96: supplier.udfSp96,
//                             udfSp97: supplier.udfSp97,
//                             udfSp98: supplier.udfSp98,
//                             udfSp99: supplier.udfSp99,
//                             udfSp910: supplier.udfSp910,
//                             udfSpD1: supplier.udfSpD1,
//                             udfSpD2: supplier.udfSpD2,
//                             udfSpD3: supplier.udfSpD3,
//                             udfSpD4: supplier.udfSpD4,
//                             udfSpD5: supplier.udfSpD5,
//                             udfSpD6: supplier.udfSpD6,
//                             udfSpD7: supplier.udfSpD7,
//                             udfSpD8: supplier.udfSpD8,
//                             udfSpD9: supplier.udfSpD9,
//                             udfSpD10: supplier.udfSpD10,
//                             projectId: project._id
//                         });
//                         newSupplier.save();
//                     });
//                     DocDef.find({projectId: req.body.copyId}).then(ddfs => {
//                         ddfs.map(ddf => {
//                             const newDocDef = new DocDef({
//                                 code: ddf.code,
//                                 location: ddf.location,
//                                 field: ddf.field,
//                                 description: ddf.description,
//                                 row1: ddf.row1,
//                                 col1: ddf.col1,
//                                 grid: ddf.grid,
//                                 worksheet1: ddf.worksheet1,
//                                 worksheet2: ddf.worksheet2,
//                                 row2: ddf.row2,
//                                 col2: ddf.col2,
//                                 doctypeId: ddf.doctypeId,
//                                 projectId: project._id
//                             });
//                             newDocDef.save();
//                         });
//                         Field.find({projectId: req.body.copyId}).then(flds => {
//                             flds.map(fld => {
//                                 const newField = new Field({
//                                     name: fld.name,
//                                     custom: fld.custom,
//                                     type: fld.type,
//                                     fromTbl: fld.fromTbl,
//                                     projectId: project._id
//                                 });
//                                 newField
//                                 .save()
//                                 .then(field => {
//                                     FieldName.find({fieldId: fld._id}).then(fldNs => {
//                                         fldNs.map(fldN => {
//                                             const newFieldName = new FieldName({
//                                                 align: fldN.align,
//                                                 edit: fldN.edit,
//                                                 forSelect: fldN.forSelect,
//                                                 forShow: fldN.forShow,
//                                                 screenId: fldN.screenId,
//                                                 fieldId: field._id,
//                                                 projectId: project._id
//                                             });
//                                             newFieldName
//                                             .save();
//                                         });
//                                         DocField.find({fieldId: fld._id}).then(dflds =>{
//                                             dflds.map( dfld => {
//                                                 DocDef.findOne({ _id: dfld.docdefId}).then(odd => {
//                                                     DocDef.findOne({code: odd.code, projectId: project._id}).then(ndd =>{
//                                                         const newDocField = new DocField({
//                                                             location: dfld.location,
//                                                             row: dfld.row,
//                                                             col: dfld.col,
//                                                             grid: dfld.grid,
//                                                             param: dfld.param,
//                                                             worksheet: dfld.worksheet,
//                                                             docdefId: ndd._id,
//                                                             fieldId: field._id,
//                                                             projectId: project._id
//                                                         });
//                                                         newDocField.save();
//                                                     }).catch(err => res.status(400).json({ message: err}));
//                                                 }).catch(err => res.status(400).json({ message: err}));
//                                             }); //map                                                                                           
//                                         }).catch(err => res.status(400).json({ message: err}));
//                                     }).catch(err => res.status(400).json({ message: err}));
//                                 }).catch(err => res.status(400).json({ message: err}));
//                             }); //map
//                             DocCountEsr.findOne({_id: req.body.copyId}).then(oldDocCountEsr => {
//                                 const newDocCountEsr = new DocCountEsr({
//                                    _id:  project._id,
//                                    seq: oldDocCountEsr.seq
//                                 });
//                                 newDocCountEsr.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountInspect.findOne({_id: req.body.copyId}).then(oldDocCountInspect => {
//                                 const newDocCountInspect = new DocCountInspect({
//                                    _id:  project._id,
//                                    seq: oldDocCountInspect.seq
//                                 });
//                                 newDocCountInspect.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountInsprel.findOne({_id: req.body.copyId}).then(oldDocCountInsprel => {
//                                 const newDocCountInsprel = new DocCountInsprel({
//                                    _id:  project._id,
//                                    seq: oldDocCountInsprel.seq
//                                 });
//                                 newDocCountInsprel.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountNfi.findOne({_id: req.body.copyId}).then(oldDocCountNfi => {
//                                 const newDocCountNfi = new DocCountNfi({
//                                    _id:  project._id,
//                                    seq: oldDocCountNfi.seq
//                                 });
//                                 newDocCountNfi.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountPf.findOne({_id: req.body.copyId}).then(oldDocCountPf => {
//                                 const newDocCountPf = new DocCountPf({
//                                    _id:  project._id,
//                                    seq: oldDocCountPf.seq
//                                 });
//                                 newDocCountPf.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountPl.findOne({_id: req.body.copyId}).then(oldDocCountPl => {
//                                 const newDocCountPl = new DocCountPl({
//                                    _id:  project._id,
//                                    seq: oldDocCountPl.seq
//                                 });
//                                 newDocCountPl.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountPn.findOne({_id: req.body.copyId}).then(oldDocCountPn => {
//                                 const newDocCountPn = new DocCountPn({
//                                    _id:  project._id,
//                                    seq: oldDocCountPn.seq
//                                 });
//                                 newDocCountPn.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountSi.findOne({_id: req.body.copyId}).then(oldDocCountSi => {
//                                 const newDocCountSi = new DocCountSi({
//                                    _id:  project._id,
//                                    seq: oldDocCountSi.seq
//                                 });
//                                 newDocCountSi.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                             DocCountSm.findOne({_id: req.body.copyId}).then(oldDocCountSm => {
//                                 const newDocCountSm = new DocCountSm({
//                                    _id:  project._id,
//                                    seq: oldDocCountSm.seq
//                                 });
//                                 newDocCountSm.save()
//                             }).catch(err => res.status(400).json({ message: err}));
//                         }).catch(err => res.status(400).json({ message: err}));
//                     }).catch(err => res.status(400).json({ message: err}));
//                 });
//                 Project.findOne({_id: req.body.copyId}).then(oldProject => {
//                     s3bucket.duplicateProject(String(oldProject.number), String(project.number))
//                     .then( () => res.json(project))
//                     .catch(error => res.status(400).json({ message: error}));
//                 }).catch(err => res.status(400).json({ message: err}));
//             }).catch(err => res.json(err));
//         }
//     }).catch(err => res.status(400).json({ message: err}));
// });

module.exports = router;

