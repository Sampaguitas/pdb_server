const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Access = require('../../models/Access');
const Supplier = require('../../models/Supplier');
const Field = require('../../models/Field');
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id

    Project.findByIdAndRemove(id, function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(1301).message
                //"1301": "Project does not exist",
            });
        }
        else {
            Access.find({ projectId: id }).then(acss => {
                acss.forEach(acs => {
                    Access.findByIdAndRemove(acs._id, function(err, a) {
                        if (!a) {
                            console.log('access does not exist');
                        } else {
                            console.log('access has been deleted')
                        }
                    });
                });
            }); 
            Supplier.find({ projectId: id }).then(spls => {
                spls.forEach(spl => {
                    Supplier.findByIdAndRemove(spl._id, function(err, s) {
                        if (!s) {
                            console.log('supplier does not exist');
                        } else {
                            console.log('supplier has been deleted')
                        }
                    });
                });
            });            
            Field.find({ projectId: id }).then(flds => {
                flds.forEach(fld => {
                    Field.findByIdAndRemove(fld._id, function(err, f) {
                        if (!f) {
                            console.log('field does not exist');
                        } else {
                            console.log('field has been deleted')
                        }
                    });
                });
            });
            FieldName.find({ projectId: id }).then(fldNs => {
                fldNs.forEach(fldN => {
                    FieldName.findByIdAndRemove(fldN._id, function(err, f) {
                        if (!f) {
                            console.log('fieldName does not exist');
                        } else {
                            console.log('fieldName has been deleted')
                        }
                    });
                });
            });

            // const Path = path.join('files','templates');
            // const projectDir = project.number;

            // //check if the project directory exists
            // if (!fs.existsSync(path.join(Path,projectDir))){
            //     //if it does, list all the files in the directory
            //     fs.readdir(path.join(Path,oldDir), function (err, files) {
            //         //loop trough each of the files and delete
            //         files.map((file) => {
            //             fs.unlink(path.join(Path,projectDir, file), function(err, f) {

            //             });
            //         });
            //         //then delete the directory once empty
            //         fs.rmdir(path, function(err, d) {
            //             console.log(`${d} ${err ? "did not get deleted" : "was deleted"`)
            //         })
            //     });
            // }  

            return res.status(200).json({
                message: fault(1303).message
                //"1303": "Project has been deleted",
            });
        }
    });
});

module.exports = router;