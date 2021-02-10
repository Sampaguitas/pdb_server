const express = require('express');
const mongoose = require("mongoose");
const Project = require("../../models/Project");
const Supplier = require("../../models/Supplier");
const ColliType = require("../../models/ColliType");
const router = express.Router();


router.post("/", (req, res) => {
    let myPromises = [];
    const { copyId } = req.body;
    const projectId = mongoose.Types.ObjectId();
    require("../../models/Project")
    .findById(copyId)
    .populate([
        {
            path:"suppliers"
        },
        {
            path: "collitypes"
        }
    ])
    .exec(function(err, parentTemplate) {
        if (!!err || !parentTemplate) {
            res.status(400).json({ message: "could not locate parent template."})
        } else {
            myPromises.push(createProject(projectId, parentTemplate.cifName, req.body));
            parentTemplate.suppliers.map(supplier => myPromises.push(createSupplier(projectId, supplier)));
            parentTemplate.collitypes.map(collitype => myPromises.push(createCollitype(projectId, collitype)));
            Promise.all(myPromises).then( () => res.status(200).json({parentTemplate: parentTemplate}));
        }
    });
});

module.exports = router;

function createProject(projectId, cifName, reqBody) {
    return new Promise(function(resolve) {
        const { name, erpId, currencyId, opcoId, enableInspection, enableShipping, enableWarehouse } = reqBody;
        const newProject = new Project({
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
        
        console.log(newProject);
        resolve();
        // newProject.save().then(() => resolve());
    });
}

function createSupplier(projectId, supplier) {
    return new Promise(function(resolve) {
        
        supplier._id = mongoose.Types.ObjectId();
        supplier.projectId = projectId;
        supplier.daveId = undefined;
        const newSupplier = new Supplier(supplier);
        
        console.log(newSupplier);
        resolve();
        // newSupplier.save().then(() => resolve());
    });
}

function createCollitype(projectId, collitype) {
    return new Promise(function(resolve) {
        
        collitype._id = mongoose.Types.ObjectId();
        collitype.projectId = projectId;
        collitype.daveId = undefined;
        const newColliType = new ColliType(collitype);
        
        console.log(newColliType);
        resolve();
        // newSupplier.save().then(() => resolve());
    });
}
