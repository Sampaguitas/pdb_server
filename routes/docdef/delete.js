const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const DocDef = require('../../models/DocDef');
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');
var s3bucket = require('../../middleware/s3bucket');
router.delete('/', (req, res) => {
    const id = req.query.id
    DocDef.findByIdAndRemove(id, function (err, docdef) {
        if (err) {
            return res.status(400).json({
                message: err
                //An error occured",
            });            
        } else if (!docdef) {
            return res.status(400).json({
                message: fault(0401).message
                //"0401": "DocDef does not exist",
            });
        }
        else {
            DocField.find({docdefId: docdef._id}).then(dfls => {
                dfls.forEach(dfl => {
                    DocField.findByIdAndRemove(dfl._id, function(err, df) {
                        if (err) {
                            console.log('An error occured');
                        } else if (!df) {
                            console.log('DocField does not exist');
                        } else {
                            console.log('DocField has been deleted');
                        }
                    });
                });
                Project.find({_id: docdef.projectId}, function (err, project) {
                    if(err) {
                        return res.status(400).json({
                            message: err
                            //An error occured",
                        }); 
                    } else if (!project) {
                        return res.status(400).json({
                            message: fault(1301).message
                            //"1301": "Project does not exist",
                        });
                    } else {
                        s3bucket.deleteFile(docdef.field, String(project.number))
                        .then(fulfilled => res.status(200).json({ message: fulfilled })) //"2403": "Template has been deleted",
                        .catch(rejected => res.status(400).json({ message: rejected})); // "An error has occured",
                    }
                });
            });
        }
    });
});

module.exports = router;