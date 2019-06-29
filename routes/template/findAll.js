var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const fault = require('../../utilities/Errors');

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

    if (!project) {
      return res.status(400).json({
        message: fault(2400).message
        //"2400": "No Project selected",
      });      
    } else {
      var s3 = new aws.S3();

      var params = {
          Bucket: awsBucketName,
          Prefix: path.join('templates', project),
      };
      s3.listObjectsV2(params, function(err, data) {
        if (err) {
            return res.status(400).json({
                message: fault(2405).message
                //"2405": "An error occurred",
              });              
        } else {
            return res.json(data);
        }
      });

    }
    
});

module.exports = router;