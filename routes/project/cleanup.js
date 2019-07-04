const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Access = require('../../models/Access');
const Supplier = require('../../models/Supplier');
const Field = require('../../models/Field');
const FieldName = require('../../models/FieldName');
const DocDef = require('../../models/DocDef');
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');
const fs = require('fs');
var path = require('path');
var s3bucket = require('../../middleware/s3bucket');

router.post('/', (req, res) => {
    //const id = req.query.id

    Access.find({}).then(accs => {
        accs.forEach(acc => {
            Project.findById(acc.projectId).then(accResult => {
                if(!accResult) {
                    console.log('deleting Access'),
                    Access.findByIdAndDelete(acc._id);
                }
            }).catch(err => console.log(err));
        });
        Supplier.find({}).then(sups => {
            sups.forEach(sup => {
                Project.findById(sup.projectId).then(supResult => {
                    if(!supResult) {
                        console.log('deleting Supplier'),
                        Supplier.findByIdAndDelete(sup._id)
                    }
                }).catch(err => console.log(err));
            });
            Field.find({}).then(flds => {
                flds.forEach(fld => {
                    Project.findById(fld.projectId).then(fldResult => {
                        if(!fldResult) {
                            console.log('deleting Field'),
                            Field.findByIdAndDelete(fld._id);
                        }
                    }).catch(err => console.log(err));
                });
                FieldName.find({}).then(fldns => {
                    fldns.forEach(fldn => {
                        Project.findById(fldn.projectId).then(fldnResult => {
                            if(!fldnResult) {
                                console.log('deleting FieldName'),
                                FieldName.findByIdAndDelete(fldn._id);
                            }
                        }).catch(err => console.log(err));
                    });
                    DocDef.find({}).then(ddfs => {
                        ddfs.forEach(ddf => {
                            Project.findById(ddf.projectId).then(ddfResult => {
                                if(!ddfResult) {
                                    console.log('deleting DocDef'),
                                    DocDef.findByIdAndDelete(ddf._id);
                                }
                            }).catch(err => console.log(err));
                        });
                        DocField.find({}).then(dflds => {
                            dflds.forEach(dfld => {
                                Project.findById(dfld.projectId).then(dfldResult => {
                                    if(!dfldResult) {
                                        console.log('deleting DocField'),
                                        DocField.findByIdAndDelete(dfld._id);
                                    }
                                }).catch(err => console.log(err));
                            }); 
                        }); 
                    }); 
                }); 
            }); 
        });
    });
    res.status(200).json({ message: 'done' }); 
});

module.exports = router;