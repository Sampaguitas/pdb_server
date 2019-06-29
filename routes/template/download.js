var express = require('express');
const router = express.Router();
var s3bucket = require('../../middleware/s3bucket');

router.get('/', function (req, res) {
  s3bucket.deleteFile(req,res);
});

module.exports = router;