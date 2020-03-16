var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;
const DocDef = require('../../models/DocDef');
var Excel = require('exceljs');
fs = require('fs');
const stream = require('stream');
const _ = require('lodash');


aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  
  const docDef = req.query.docDef;
  let myPromises = [];
  DocDef.findById(docDef)
  .populate([
    {
      path: 'project'
    },
    {
      path: 'docfields',
      populate: {
        path: 'fields'
      }
    } 
  ])
  .exec(function (errDocDef, resDocDef) {
    if (errDocDef || !resDocDef) {
      return res.status(400).json({message: 'An error occured'});
    } else if (!resDocDef.project || _.isUndefined(resDocDef.project.number)) {
      return res.status(400).json({message: 'Could not retrive project information.'});
    } else if (_.isEmpty(resDocDef.docfields)) {
      return res.status(400).json({message: 'Could not retrive document fields.'});
    } else {
      var s3 = new aws.S3();
      var params = {
          Bucket: awsBucketName,
          Key: path.join('templates', String(resDocDef.project.number), resDocDef.field),
      };
      var wb = new Excel.Workbook();
      wb.xlsx.read(s3.getObject(params).createReadStream())
      .then(workbook => {
        resDocDef.docfields.map(docfield => {
          myPromises.push(getField(resDocDef, docfield))
        });
        Promise.all(myPromises).then(function (fields) {
          fields.filter(n => n);
          fields.map(field => {
            const worksheet = getWorksheet(field.worksheet, workbook);
            var cell = worksheet.getCell(`${field.address}`); 
            with(cell){
              value = {
                'richText': [
                  {
                    'font': {
                      'size': 12,
                      'color': {'argb': 'FFFFFFFF'},
                      'name': 'Arial',
                      'scheme': 'minor'
                    },
                    'text': `${field.custom}(${field.param})`
                  },
                ]
              };
              style = Object.create(cell.style); //shallow-clone the style, break references
              fill = {
                'type': 'pattern',
                'pattern':'solid',
                'fgColor': {argb:'FFED1C24'}
              };
            }
          });
          workbook.xlsx.write(res);
        });
      });
    }
  });
});

function getField(resDocDef, docfield) {
  return new Promise(function(resolve) {
    resolve({
      custom: docfield.fields.custom || '',
      param: docfield.param || '',
      address: getFieldAddress(docfield, resDocDef),
      worksheet: getFieldSheet(docfield)
    });
  });
}

function getFieldSheet(docField) {
  if (docField.worksheet !== 'Sheet2') {
    return 'Sheet1';
  } else {
    return 'Sheet2';
  }
}

function getWorksheet(worksheet, workbook) {
  if (worksheet !== 'Sheet2') {
    return workbook.getWorksheet(1);
  } else {
    return workbook.getWorksheet(2);
  }
}

function getFieldAddress (docfield, resDocDef) {
  let tempFieldRow = docfield.row || 1;
  if (docfield.location === 'Header') {
    return alphabet(docfield.col) + docfield.row;
  } else if (docfield.worksheet !== 'Sheet2') {
    return alphabet(docfield.col) + (resDocDef.row1 + tempFieldRow - 1);
  } else {
    return alphabet(docfield.col) + (resDocDef.row2 + tempFieldRow - 1);
  }
}

function alphabet(num){
  var s = '', t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = (num - t)/26 | 0;
  }
  return s || undefined;
}

module.exports = router;