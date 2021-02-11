const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const _ = require("lodash");
const { reject } = require("bluebird");

let counters = [
    {"collection": "DocCountEsr", "populated": "doccountesr" },
    {"collection": "DocCountInspect", "populated": "doccountinspect" },
    {"collection": "DocCountInsprel", "populated": "doccountinsprel" },
    {"collection": "DocCountNfi", "populated": "doccountnfi" },
    {"collection": "DocCountPf", "populated": "doccountpf" },
    {"collection": "DocCountPl", "populated": "doccountpl" },
    {"collection": "DocCountPn", "populated": "doccountpn" },
    {"collection": "DocCountPt", "populated": "doccountpt" },
    {"collection": "DocCountSh", "populated": "doccountsh" },
    {"collection": "DocCountSi", "populated": "doccountsi" },
    {"collection": "DocCountSm", "populated": "doccountsm" },
    {"collection": "DocCountWhPl", "populated": "doccountwhpl" },
    {"collection": "DocCountWhPn", "populated": "doccountwhpn" },
    {"collection": "DocCountWhSi", "populated": "doccountwhsi" },
    {"collection": "DocCountWhSm", "populated": "doccountwhsm" },
];

router.post("/", (req, res) => {
    let myPromisesFirst = [];
    let myPromisesSecond = [];
    const { copyId, projectUsers } = req.body;
    const projectId = mongoose.Types.ObjectId();
    
    require("../../models/Project")
    .findById(copyId)
    .populate([
        { path:"suppliers" },
        { path: "collitypes" },
        { path: "docdefs" },
        { path: "fields", populate: [ { path: "fieldnames" }, { path: "docfields", populate: { path: "docdef" } } ] },
        { path: "doccountesr" },
        { path: "doccountinspect" },
        { path: "doccountinsprel" },
        { path: "doccountnfi" },
        { path: "doccountpf" },
        { path: "doccountpl" },
        { path: "doccountpn" },
        { path: "doccountpt" },
        { path: "doccountsh" },
        { path: "doccountsi" },
        { path: "doccountsm" },
        { path: "doccountwhpl" },
        { path: "doccountwhpn" },
        { path: "doccountwhsi" },
        { path: "doccountwhsm" }
    ])
    .exec(function(err, parentTemplate) {
        if (!!err || !parentTemplate) {
            return res.status(400).json({ message: "could not locate parent template."});
        } else {
            createProject(projectId, parentTemplate.cifName, req.body)
            .then(newProject => {
                myPromisesFirst.push(require('../../middleware/s3bucket').duplicateProject(String(parentTemplate.number), String(newProject.number)));
                assignedUsers(projectUsers).map(assignedUser => myPromisesFirst.push(createAccess(projectId, assignedUser)));
                parentTemplate.suppliers.map(supplier => myPromisesFirst.push(createSupplier(projectId, supplier)));
                parentTemplate.collitypes.map(collitype => myPromisesFirst.push(createCollitype(projectId, collitype)));
                parentTemplate.docdefs.map(docdef => myPromisesFirst.push(createDocDef(projectId, docdef)));
                counters.map(counter => myPromisesFirst.push(createDocCount(projectId, counter.collection, parentTemplate[counter.populated])));
                Promise.all(myPromisesFirst).then( () => { 
                    parentTemplate.fields.map(field => {
                        let fieldId = mongoose.Types.ObjectId();
                        myPromisesSecond.push(createField(projectId, fieldId, field));
                        field.fieldnames.map(fieldname => myPromisesSecond.push(createFieldName(projectId, fieldId, fieldname)));
                        field.docfields.map(docfield => myPromisesSecond.push(createDocField(projectId, fieldId, docfield)));
                    });
                    Promise.all(myPromisesSecond).then( () => res.json(newProject));
                });
            })
            .catch( () => res.status(400).json({ message: "could not retreive project"}));
        }
    });
});

module.exports = router;

function createProject(projectId, cifName, reqBody) {
    return new Promise(function(resolve) {
        const { name, erpId, currencyId, opcoId, enableInspection, enableShipping, enableWarehouse } = reqBody;
        const newProject = new require("../../models/Project")({
            _id: projectId,
            name,
            erpId,
            currencyId,
            opcoId,
            enableInspection,
            enableShipping,
            enableWarehouse,
            cifName,
        });
        newProject.save()
        .then(newProject => resolve(newProject))
        .catch( () => reject());
    });
}

function assignedUsers(projectUsers) {
    return projectUsers.filter(function(projectUser) {
        return projectUser.isExpediting || projectUser.isInspection || projectUser.isShipping || projectUser.isWarehouse || projectUser.isConfiguration;
    });
}

function createAccess(projectId, assignedUser) {
    return new Promise(function(resolve) {
        const newAccess = new require("../../models/Access")({
            isExpediting: assignedUser.isExpediting,
            isInspection: assignedUser.isInspection,
            isShipping: assignedUser.isShipping,
            isWarehouse: assignedUser.isWarehouse,
            isConfiguration: assignedUser.isConfiguration,
            projectId: projectId,
            userId: assignedUser.userId
        });
        newAccess.save().then(() => resolve());
    });
}

function createSupplier(projectId, supplier) {
    return new Promise(function(resolve) {
        let clonedSupplier = cloneObject(supplier);
        clonedSupplier._id = mongoose.Types.ObjectId();
        clonedSupplier.projectId = projectId;
        clonedSupplier.daveId = undefined;
        const newSupplier = new require("../../models/Supplier")(clonedSupplier);
        newSupplier.save().then(() => resolve());
    });
}

function createCollitype(projectId, collitype) {
    return new Promise(function(resolve) {
        let clonedCollitype = cloneObject(collitype);
        clonedCollitype._id = mongoose.Types.ObjectId();
        clonedCollitype.projectId = projectId;
        clonedCollitype.daveId = undefined;
        const newColliType = new require("../../models/ColliType")(clonedCollitype);
        newColliType.save().then(() => resolve());
    });
}

function createDocDef(projectId, docdef) {
    return new Promise(function(resolve) {
        let clonedDocDef = cloneObject(docdef);
        clonedDocDef._id = mongoose.Types.ObjectId();
        clonedDocDef.projectId = projectId;
        clonedDocDef.daveId = undefined;
        const newDocDef = new require("../../models/DocDef")(clonedDocDef);
        newDocDef.save().then(() => resolve());
    });
}

function createField(projectId, fieldId, field) {
    return new Promise(function(resolve) {
        let clonedField = cloneObject(field);
        clonedField._id = fieldId;
        clonedField.projectId = projectId;
        clonedField.daveId = undefined;
        const newField = new require("../../models/Field")(clonedField);
        newField.save().then(() => resolve());
    });
}

function createFieldName(projectId, fieldId, fieldname) {
    return new Promise(function(resolve) {
        let clonedFieldName = cloneObject(fieldname);
        clonedFieldName._id = mongoose.Types.ObjectId();
        clonedFieldName.fieldId = fieldId;
        clonedFieldName.projectId = projectId;
        clonedFieldName.daveId = undefined;
        const newFieldName = new require("../../models/FieldName")(clonedFieldName);
        newFieldName.save().then(() => resolve());
    });
}

function createDocField(projectId, fieldId, docfield) {
    return new Promise(function(resolve) {
        require("../../models/DocDef").findOne({ projectId: projectId, code: docfield.docdef.code }, function(err, res) {
            if (!!err || !res) {
                resolve();
            } else {
                let clonedDocField = cloneObject(docfield);
                clonedDocField._id = mongoose.Types.ObjectId();
                clonedDocField.docdefId = res._id;
                clonedDocField.fieldId = fieldId;
                clonedDocField.projectId = projectId;
                clonedDocField.daveId = undefined;
                const newDocField = new require("../../models/DocField")(clonedDocField);
                newDocField.save().then(() => resolve());
            }
        });
    });
}

function createDocCount(projectId, collection, populated) {
    return new Promise(function(resolve) {
        let cloned = cloneObject(populated);
        cloned._id = projectId;
        const newDocCount = new require(`../../models/${collection}`)(cloned);
        newDocCount.save().then(() => resolve());
    });
}

function cloneObject(object) {
    var clone = {};
    for (var p in object) {
        clone[p] = object[p];
    }
    return clone;
}