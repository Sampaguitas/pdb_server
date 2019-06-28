var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');

//configuring the AWS environment
const accessKeyId = require('../../config/keys').accessKeyId;
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;

aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

router.get('/', function (req, res) {

    const project = req.body.project;
    const file = req.body.file;

    if (!project) {
      return res.status(400).json({
        message: fault(2400).message
        //"2400": "No Project selected",
      });      
    } else if (!file) {
      return res.status(400).json({
        message: fault(2401).message
        //"2401": "No file selected",
      });         
    } else {
      var s3 = new aws.S3();

      var params = {
          Bucket: awsBucketName,
          Key: path.join('templates', project, file),
      };

      res.attachment(file);
      var fileStream = s3.getObject(params).createReadStream();
      fileStream.pipe(res);

    }
    
});

module.exports = router;