var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
var accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
var secretAccessKey = require('../../config/keys').secretAccessKey;
var region = require('../../config/keys').region;
var awsBucketName = require('../../config/keys').awsBucketName;
var _ = require('lodash');
var Heat = require('../../models/Heat');
const HummusRecipe = require('hummus-recipe');
const fs = require('fs');

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});



router.get('/', function (req, res) {

  const heatId = decodeURI(req.query.heatId);
  const timeStamp = Date.now();
  const inputFile = path.join('temp', 'input', `${timeStamp}.pdf`);
  const outputFile = path.join('temp', 'output', `${timeStamp}.pdf`);

  if (!heatId) {
    return res.status(400).json({message: 'heatId is missing.'});
  } else {
    Heat.findById(heatId)
    .populate([
    {
      path: 'sub',
      populate: [
        {
          path: 'po',
          populate: [
            {
              path: 'project',
            }
          ]
        },
      ]
    },
    {
      path: 'certificate'
    }
    ])
    .exec(function(err, heat) {
      if (err) {
        res.status(400).json({ message: 'An error has occured.' });
      } else if (!heat.certificate.hasFile) {
        res.status(400).json({ message: 'No file has been uploaded for selected certificate'});
      } else {
        writeFile(heat, inputFile, outputFile)
        .then(file => {
          res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/pdf',
            'Access-Control-Expose-Headers': 'Content-Disposition',
            'Content-Disposition': `attachment; filename=${file.name}`,
          });
          file.stream.pipe(res);
        })
        .catch(error => {
          res.status(400).json({message: error.message})
        });
      }
    });
  }
});

module.exports = router;

function getName(heat) { //cifName, po, sub, heat
  let cifName = heat.sub.po.project.cifName || '';
  if (!cifName) {
    return `MTC${heat.certificate.cif}_HeatNr${heat.heatNr}.pdf`
  } else {
    let badChars = /[^\w\s\_\-]/mg
    cifName = cifName.replace('[clPo]', String(heat.sub.po.clPo) || '');
    cifName = cifName.replace('[clPoRev]', String(heat.sub.po.clPoRev) || '');
    cifName = cifName.replace('[clPoItem]', String(heat.sub.po.clPoItem) || '');
    cifName = cifName.replace('[clCode]', String(heat.sub.po.clCode) || ''); //
    cifName = cifName.replace('[vlSo]', String(heat.sub.po.vlSo) || '');
    cifName = cifName.replace('[vlSoItem]', String(heat.sub.po.vlSoItem) || '');
    cifName = cifName.replace('[nfi]', String(heat.sub.nfi) || '');
    cifName = cifName.replace('[cif]', String(heat.certificate.cif) || '');
    cifName = cifName.replace('[heatNr]', String(heat.heatNr) || '');
    cifName = cifName.replace('[inspQty]', String(heat.inspQty) || '');
    cifName = cifName.replace(badChars, '');
    return `${cifName}.pdf`
  }
}

function writeFile(heat, inputFile, outputFile) {
  return new Promise(function(resolve, reject) {
    
    var s3 = new aws.S3();
    var params = {
        Bucket: awsBucketName,
        Key: path.join('certificates', `${heat.certificateId}.pdf`),
    };
    var fileStream = fs.createWriteStream(inputFile);
    var s3Stream = s3.getObject(params).createReadStream();

    s3Stream.on('error', function(err) {
      reject({message: 'The specified key does not exist'});
    });

    s3Stream.pipe(fileStream).on('error', function(err) {
      reject({message: 'An error occured when writing data to the file'});
    }).on('close', () => {
      addHeader(inputFile, outputFile)
      .then(stream => {
        resolve({
          stream: stream,
          name: getName(heat)
        });
      })
        
    });
  });
}

function addHeader(inputFile, outputFile) {
  return new Promise(function(resolve) {
    const pdfDoc = new HummusRecipe(inputFile, outputFile);
    
    pdfDoc
    // edit 1st page
    .editPage(1)
    // .text('this is', 10, 10)
    // .text('my first', 200, 10)
    // .text('test line', 400, 10)
    // .text('this is', 10, 25)
    // .text('my second', 200, 25)
    // .text('test line', 400, 25)
    // .text('this is', 10, 40)
    // .text('my third', 200, 40)
    // .text('test line', 400, 40)
    .endPage()
    // end and save
    .endPDF( () => {
      let stream = fs.createReadStream(outputFile, { emitClose: true });
      stream.on('end', function () {
        stream.close();
      });
      stream.on("close", function () {
        stream.destroy();
        deleteFile(inputFile);
        deleteFile(outputFile);
      });
      resolve(stream);
    });
  }) 
}

function deleteFile(targetPath) {
  fs.unlink(targetPath, function (err) {
    if (err) {
      console.log(`Error in deleting the file: ${err}`);
    }
  });
}