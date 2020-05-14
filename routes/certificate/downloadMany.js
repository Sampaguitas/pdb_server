var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
var accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
var secretAccessKey = require('../../config/keys').secretAccessKey;
var region = require('../../config/keys').region;
var awsBucketName = require('../../config/keys').awsBucketName;
var archiver = require('archiver');
var _ = require('lodash');
var Project = require('../../models/Project');



aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

let poIds = [];
let subIds = [];
let certificateIds = [];
let heatIds = [];
let myFiles = [];

router.post('/', function (req, res) {



  const projectId = req.body.projectId;
  const selectedIds = req.body.selectedIds;

  selectedIds.forEach(element => {
    element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
    element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
    element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
    element.heatId && !heatIds.includes(element.heatId) && heatIds.push(element.heatId);
  });

  // create a file to stream archive data to.
  var archive = archiver('zip');
  var output = res;

  // output.on('close', function() {
  //   archive.end();
  // });

  // output.on('end', function() {
  //   console.log('Data has been drained');
  // });

  // pipe archive data to the file
  archive.pipe(output);


  if (_.isEmpty(certificateIds)) {
    return res.status(400).json({message: 'Certificate Ids is missing.'});
  } else {
    Project.findById(projectId)
    .populate([
    {
      path: 'pos',
      match: { _id: { $in: poIds} },
      options: { sort: { clPo: 'asc', clPoRev: 'asc', clPoItem: 'asc' } },
      populate: [
        {
          path: 'subs',
          match: { _id: { $in: subIds} },
          populate: [
            {
              path: 'heats',
              match: { _id: { $in: heatIds} },
              options: {
                  sort: {
                      heatNr: 'asc'
                  }
              },
              populate: {
                  path: 'certificate',
              }
            },
          ]
        },
      ]
    },
    ])
    .exec(async function(err, project) {
      if (project.pos) {
        project.pos.map(po => {
          if (po.subs) {
            po.subs.map(sub => {
              if (sub.heats) {
                
                let heats = sub.heats.reduce(function (acc, cur) {
                  if(!!cur.certificate.hasFile) {
                    acc.push(cur);
                  }
                  return acc;
                }, []);
                heats.forEach(heat => {
                  myFiles.push(getFile(project.cifName, po, sub, heat));
                });
              }
            });
          }
        });
        await Promise.all(myFiles).then(files => {
          files.map(file => {
            // append a file from stream
            archive.append(file.stream, {name: file.name});
          });
        });
        archive.finalize();
      }
    });
  }
  
});

module.exports = router;


function getFile(cifName, po, sub, heat) {
  return new Promise(function (resolve) {
    var s3 = new aws.S3();
    var params = {
        Bucket: awsBucketName,
        Key: path.join('certificates', `${heat.certificateId}.pdf`),
    };
    let thatStream = s3.getObject(params).createReadStream();

    resolve({
      stream: thatStream,
      name: getName(cifName, po, sub, heat)
    });
  });
}

function getName(cifName, po, sub, heat) {
  if (!cifName) {
    return `MTC${heat.certificate.cif}_HeatNr${heat.heatNr}.pdf`
  } else {
    let badChars = /[^\w\s\_\-]/mg
    cifName = cifName.replace('[clPo]', String(po.clPo) || '');
    cifName = cifName.replace('[clPoRev]', String(po.clPoRev) || '');
    cifName = cifName.replace('[clPoItem]', String(po.clPoItem) || '');
    cifName = cifName.replace('[clCode]', String(po.clCode) || ''); //
    cifName = cifName.replace('[vlSo]', String(po.vlSo) || '');
    cifName = cifName.replace('[vlSoItem]', String(po.vlSoItem) || '');
    cifName = cifName.replace('[nfi]', String(sub.nfi) || '');
    cifName = cifName.replace('[cif]', String(heat.certificate.cif) || '');
    cifName = cifName.replace('[heatNr]', String(heat.heatNr) || '');
    cifName = cifName.replace('[inspQty]', String(heat.inspQty) || '');
    cifName = cifName.replace(badChars, '');
    return `${cifName}.pdf`
  }

}
