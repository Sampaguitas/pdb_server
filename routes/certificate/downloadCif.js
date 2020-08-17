var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;


aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  const id = decodeURI(req.query.id);
  if (!id) {
    return res.status(400).json({message: 'Certificate ID is missing.'});
  } else {
    
    var s3 = new aws.S3();
    var params = {
        Bucket: awsBucketName,
        Key: path.join('certificates', `${id}.pdf`),
    };

    s3.getObject(params).createReadStream()
    .on('error', () => {
    res.status(400).json({message: "File could not be located - Please upload a new one"});
    }).pipe(res);

  }
});

module.exports = router;


