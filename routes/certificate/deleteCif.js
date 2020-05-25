var express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
var s3bucket = require('../../middleware/s3bucket');

router.delete('/', function (req, res) {
  const id = decodeURI(req.query.id);
  s3bucket.deleteCif(id)
  .then(result => {
    if(result.isRejected) {
      return res.status(400).json({ message: result.message});
    } else {
      Certificate.findByIdAndUpdate(id, {hasFile: false}, function(err) {
        if (err) {
            res.status(400).json({ message: 'The file has been deleted but we could not update the certifiacate info.'});
        } else {
            res.status(200).json({ message: 'The file has succesfully been deleted.'});
        }
      });
    }
    // Certificate.findByIdAndUpdate(id, {hasFile: false}, function(err) {
    //     if (err) {
    //         res.status(400).json({ message: 'The file has been deleted but we could not update the certifiacate info.'});
    //     } else {
    //         res.status(200).json({ message: 'The file has succesfully been deleted.'});
    //     }
    // });
  });
  // .catch(error => res.status(400).json({ message: error.message}));
});

module.exports = router;