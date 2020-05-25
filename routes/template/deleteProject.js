var express = require('express');
const router = express.Router();
var s3bucket = require('../../middleware/s3bucket');

router.delete('/', function (req,res){
  const project = req.body.project;
  
  s3bucket.deleteProject(String(project))
  .then(result => res.status(result.isRejected ? 400 : 200).json({ message: result.message }))
  // .catch(error => res.status(400).json({ message: error}));
});

module.exports = router;