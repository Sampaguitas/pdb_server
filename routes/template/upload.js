var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var s3bucket = require('../../middleware/s3bucket');
const DocDef = require('../../models/DocDef');

router.post('/', upload.single('file'), function (req, res) {
  const file = req.body.file;
  const documentId = req.body.documentId;
  const project = req.body.project;
  console.log('file:', file);
  console.log('documentId:', documentId);
  console.log('project:', project);
  console.log('fileName:', file.name);
  DocDef.findOneAndUpdate({_id: documentId}, {field: file.name}, function(err, doc) {
    if (err) {
      console.log('err:', err)
      return res.status(400).json({message: 'unexpected error'});
    } else if (doc) {
      console.log('doc:', doc);
      s3bucket.uploadFile(file, String(project))
      .then(fulfilled => res.send(fulfilled))
      .catch(error => res.status(400).json({ message: error}));
    }
  });
});

module.exports = router;