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

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {

  const heatId = decodeURI(req.query.heatId);

  if (!heatId) {
    return res.status(400).json({message: 'heatId is missing.'});
  } else {
    Heat.findById(heatId)
    .populate([
    {
      path: 'sub',
      populate: {
        path: 'po',
        populate: {
          path: 'project',
        }
      },
    },
    {
      path: 'return',
      populate: {
        path: 'po',
        populate: {
          path: 'project',
        }
      },
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
        getFile(heat).then(file => {
          res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/pdf',
            'Access-Control-Expose-Headers': 'Content-Disposition',
            'Content-Disposition': `attachment; filename=${file.name}`,
          });
          file.stream.pipe(res);
        });
      }
    });
  }
});

module.exports = router;


function getFile(heat) {//cifName, po, sub, heat
  return new Promise(function (resolve) {
    var s3 = new aws.S3();
    var params = {
        Bucket: awsBucketName,
        Key: path.join('certificates', `${heat.certificateId}.pdf`),
    };
    let stream = s3.getObject(params).createReadStream();

    resolve({
      stream: stream,
      name: getName(heat)
    });
  });
}

function getName(heat) { //cifName, po, sub, heat
  let cifName = heat.hasOwnProperty('sub') ? heat.sub.po.project.cifName || '' : heat.hasOwnProperty('return') && heat.return.po.project.cifName || '';
  if (!cifName) {
    return `MTC${heat.certificate.cif}_HeatNr${heat.heatNr}.pdf`
  } else {
    let badChars = /[^\w\s\_\-]/mg
    cifName = cifName.replace('[clPo]', heat.hasOwnProperty('sub') ? String(heat.sub.po.clPo) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.clPo) || '' : '');
    cifName = cifName.replace('[clPoRev]', heat.hasOwnProperty('sub') ? String(heat.sub.po.clPoRev) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.clPoRev) || '' : '');
    cifName = cifName.replace('[clPoItem]', heat.hasOwnProperty('sub') ? String(heat.sub.po.clPoItem) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.clPoItem) || '' : '');
    cifName = cifName.replace('[clCode]', heat.hasOwnProperty('sub') ? String(heat.sub.po.clCode) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.clCode) || '' : ''); //
    cifName = cifName.replace('[vlSo]', heat.hasOwnProperty('sub') ? String(heat.sub.po.vlSo) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.vlSo) || '' : '');
    cifName = cifName.replace('[vlSoItem]', heat.hasOwnProperty('sub') ? String(heat.sub.po.vlSoItem) || '' : heat.hasOwnProperty('return') ? String(heat.return.po.vlSoItem) || '' : '');
    cifName = cifName.replace('[nfi]', heat.hasOwnProperty('sub') ? String(heat.sub.nfi) || '' : '');
    cifName = cifName.replace('[cif]', String(heat.certificate.cif) || '');
    cifName = cifName.replace('[heatNr]', String(heat.heatNr) || '');
    cifName = cifName.replace('[inspQty]', String(heat.inspQty) || '');
    cifName = cifName.replace(badChars, '');
    return `${cifName}.pdf`
  }
}


// s3.getObject(params).createReadStream()
    
    // const HummusRecipe = require('hummus-recipe');
    // const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');
    
    // pdfDoc
    // // edit 1st page
    // .editPage(1)
    // .text('this is', 10, 10)
    // .text('my first', 200, 10)
    // .text('test line', 400, 10)
    // .text('this is', 10, 25)
    // .text('my second', 200, 25)
    // .text('test line', 400, 25)
    // .text('this is', 10, 40)
    // .text('my third', 200, 40)
    // .text('test line', 400, 40)
    // .endPage()
    // // end and save
    // .endPDF();

    // res.status(400).json({message: 'toto'});