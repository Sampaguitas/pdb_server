var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const Certificate = require('../../models/Certificate');
var s3bucket = require('../../middleware/s3bucket');
fs = require('fs');

router.post('/', upload.single('file'), function (req, res) {

  const id = req.body.id;
  const file = req.file;
  
  s3bucket.uploadCif(file, id)
  .then(Certificate.findByIdAndUpdate(id, {hasFile: true}, function(err) {
    if (err) {
      res.status(400).json({ message: 'File could not be uploaded.'})
    } else {
      res.status(200).json({ message: 'File has successfully been uploaded.'})
    }
  }))
  .catch( error => res.status(400).json({ message: error.message }));
});

module.exports = router;