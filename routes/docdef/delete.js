const express = require('express');
const router = express.Router();
// const Project = require('../../models/Project');
const DocDef = require('../../models/DocDef');
// const DocField = require('../../models/DocField');
// var s3bucket = require('../../middleware/s3bucket');
router.delete('/', (req, res) => {
    const id = req.query.id
    DocDef.findByIdAndDelete(id, function (err, docdef) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!docdef) {
            return res.status(400).json({ message: 'Could not find DocDef.'});
        } else {
            return res.status(200).json({ message: 'DocDef has successfully been deleted.'});
        }
    });
    
    // DocDef.findByIdAndDelete(id, function (err, docdef) {
    //     if (err) {
    //         return res.status(400).json({message: 'An error occured'});            
    //     } else if (!docdef) {
    //         return res.status(400).json({message: 'DocDef does not exist'});
    //     }
    //     else {
    //         DocField.find({docdefId: docdef._id}).then(dfls => {
    //             dfls.forEach(dfl => {
    //                 DocField.findByIdAndDelete(dfl._id, function(err, df) {
    //                     if (err) {
    //                         console.log('An error occured');
    //                     } else if (!df) {
    //                         console.log('DocField does not exist');
    //                     } else {
    //                         console.log('DocField has been deleted');
    //                     }
    //                 });
    //             });
    //             Project.find({_id: docdef.projectId}, function (err, project) {
    //                 if(err) {
    //                     return res.status(400).json({message: 'An error occured'}); 
    //                 } else if (!project) {
    //                     return res.status(400).json({message: 'Project does not exist'});
    //                 } else {
    //                     s3bucket.deleteFile(docdef.field, String(project.number))
    //                     .then(result => res.status(result.isRejected ? 400 : 200).json({ message: result.message }));
    //                 }
    //             });
    //         }).catch( () => {
    //             return res.status(400).json({message: 'An error has occured'})
    //         })
    //     }
    // });
});

module.exports = router;