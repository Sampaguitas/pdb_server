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

router.delete('/', function (req, res) {

    const project = req.body.project;

    if (!project) {
      return res.status(400).json({
        message: fault(2400).message
        //"2400": "No Project selected",
      });      
    } else {
      var s3 = new aws.S3();

      var listParams = {
          Bucket: awsBucketName,
          Prefix: path.join('templates', project),
      };
      s3.listObjectsV2(listParams, function(err, listData) {
        if (err) {
            return res.status(400).json({
                message: fault(2405).message
                //"2405": "An error occurred",
              });              
        } else if (listData.Contents) {
            var candidate = [];
            listData.Contents.map(a => {
              candidate.push({ Key: a.Key })
            });
            if (_.isEmpty(candidate)) {
              return res.status(200).json({
                message: fault(2406).message
                //"2406": "The Project folder is already empty",
              });               
            } else {
              var deleteParams = {
                Bucket: awsBucketName,
                Delete: {
                    Objects: candidate,
                    Quiet: false
                }
              };
              s3.deleteObjects(deleteParams, function(err, deleteData) {
                  if (err) {
                      return res.status(400).json({
                          message: fault(2405).message
                          //"2405": "An error occurred",
                        });                     
                  } else {
                      return res.json(deleteData);
                  }
              });
            }
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