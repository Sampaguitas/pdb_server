var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');
var s3bucket = require('../../middleware/s3bucket');
fs = require('fs');

router.post('/', upload.single('file'), function (req, res) {
  const file = req.file;
  const documentId = req.body.documentId;
  const project = req.body.project;
  DocDef.findOne({_id: documentId}, function (err, oldDoc) {
    if (err){
      return res.status(400).json({message: 'An error has occured.'});
    } else if(oldDoc) {
        if(!oldDoc.field) {
          DocDef.findOneAndUpdate({_id: documentId}, {field: file.originalname}, function(err, doc) {
            if (err) {
              return res.status(400).json({message: 'An error has occured.'});
            } else if (doc) {
              s3bucket.uploadFile(file, String(project))
              .then( () => res.status(200).json({ message: 'File has successfully been uploaded.'}))
              .catch(error => res.status(400).json({ message: error}));
            }
          });
        } else {
          s3bucket.deleteFile(oldDoc.field, String(project))
          .then( () => {
            DocDef.findOneAndUpdate({_id: documentId}, {field: file.originalname}, function(err, doc) {
              if (err) {
                return res.status(400).json({message: 'An error has occured.'});
              } else if (doc) {
                s3bucket.uploadFile(file, String(project))
                .then( () => res.status(200).json({ message: 'File has successfully been updated.'}))
                .catch(error => res.status(400).json({ message: error}));
              }
            });
          })
          .catch(error => res.status(400).json({ message: error}));
        }     
    } else {
      return res.status(400).json({message: 'Document could not be found'});
    }
  });

});

module.exports = router;