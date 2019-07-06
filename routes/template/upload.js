var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors'); //../utilities/Errors
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;
fs = require('fs');

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.post('/', upload.single('file'), function (req, res) {
  const file = req.body.file;
  const fileName = req.body.fileName
  const documentId = req.body.documentId;
  const project = req.body.project;
  
  DocDef.findOneAndUpdate({_id: documentId}, {field: fileName}, function(err, doc) {
    if (err) {
      return res.status(400).json({message: 'unexpected error'});
    } else if (doc) {
      var s3 = new aws.S3();
      var params = {
        Bucket: awsBucketName,
        Body: file.buffer, //// Body: file.buffer,
        Key: path.join('templates', project, fileName), //file.originalname
      }; 
      s3.upload(params, function(err, data) {
        if (err) {
          res.status(400).json({message: fault(2405).message}); //"2405": "An error occurred",
        } else {
          res.send(data);
        }
      });
    }
  });
});

module.exports = router;