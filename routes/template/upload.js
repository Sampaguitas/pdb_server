var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var s3bucket = require('../../middleware/s3bucket');

router.post('/', upload.single('file'), function (req, res) {
  s3bucket.uploadFile(req, res);
});

module.exports = router;