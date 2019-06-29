var express = require('express');
const router = express.Router();
var s3bucket = require('../../middleware/s3bucket');

router.post('/', function (req, res) {
  const oldProject =  req.body.oldProject;
  const newProject = req.body.newProject;

  s3bucket.duplicateProject(String(oldProject),String(newProject))
  .then(fulfilled => res.status(200).json({ message: fulfilled }))
  .catch(error => res.status(400).json({ message: error}));
});

module.exports = router;