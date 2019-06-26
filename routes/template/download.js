const express = require('express');
const router = express.Router();
const fs = require('fs');
var path = require('path');

router.get('/download', function (req, res) {
    const dr = path.join('files','templates');
    const project = req.body.project;
    const file = req.body.file;

    //check if the file exist
    if (!fs.existsSync(path.join(dr,project,file))){
        //if not create the new dir
        res.json('file does not exist')
    } else {
        res.download(path.join(dr,project,file));
    } 
    
});

module.exports = router;