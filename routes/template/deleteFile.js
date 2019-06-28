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

router.delete('/', function (req, res) {

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

      s3.deleteObject(params, function(err, data) {
        if (err) {
            return res.status(400).json({
                message: fault(2405).message
                //"2405": "An error occurred",
              });              
        } else {
            return res.status(200).json({
                message: fault(2403).message
                //"2403": "Template has been deleted",
              });            
        }
      });

    }
    
});

module.exports = router;