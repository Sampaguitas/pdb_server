var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const fault = require('../../utilities/Errors');
var _ = require('lodash');

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

router.post('/', function (req, res) {

    const oldProject = req.body.oldProject;
    const newProject = req.body.newProject;

    if (!oldProject || !newProject) {
      return res.status(400).json({
        message: fault(2400).message
        //"2400": "No Project selected",
      });      
    } else {
      var s3 = new aws.S3();

      var listParams = {
          Bucket: awsBucketName,
          Prefix: path.join('templates', oldProject),
      };
      s3.listObjectsV2(listParams, function(err, listData) {
        if (err) {
            return res.status(400).json({
                message: fault(2405).message
                //"2405": "An error occurred",
              });              
        } else if (listData.Contents) {
            listData.Contents.map(a => {
                var copyParams = {
                    Bucket: awsBucketName,
                    CopySource: path.join(awsBucketName,a.Key),
                    Key: a.Key.replace(oldProject, newProject)
                };
                s3.copyObject(copyParams, function(err, data) {
                    if (err) {
                        return res.status(400).json({
                            message: fault(2405).message
                            //"2405": "An error occurred",
                          });
                    } else {
                        console.log(data); // successful response
                    }                     
                });
            });
            return res.status(200).json({
                message: fault(2407).message
                //"Templates have been copied to the new Project",
            });
        } else {
          return res.status(400).json({
            message: fault(2405).message
            //"2405": "An error occurred",
          });           
        }
      });

    } 
});

module.exports = router;