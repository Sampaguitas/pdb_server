var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const fault = require('../../utilities/Errors'); //../utilities/Errors
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;
const DocDef = require('../../models/DocDef');
const DocField = require('../../models/DocField');
const Field = require('../../models/Field');
var Excel = require('exceljs');
fs = require('fs');
const stream = require('stream');
// const XLSX = require('xlsx');


aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  
  const project = req.query.project;
  const docDef = req.query.docDef;
  //const file = req.query.file;


  if (!project){
    return res.status(400).json({message: fault(2400).message}); //"2400": "No Project selected",
  } else if (!docDef){
    return res.status(400).json({message: fault(2401).message}); //"2401": "No file selected",
  } else {
    DocDef.findById(docDef, function(errDocField, resDocDef){
      if (errDocField) {
        return res.status(400).json({message: errDocField});
      } else if (!resDocDef) {
        return res.status(400).json({message: 'an error occured'});
      } else {

        var s3 = new aws.S3();
        var params = {
            Bucket: awsBucketName,
            Key: path.join('templates', project, resDocDef.field),
        };

        var wb = new Excel.Workbook();
        wb.xlsx.read(s3.getObject(params).createReadStream())
        .then(workbook => {
          DocField.find({docdefId: docDef}, function(errDocField, resDocField){
            if (errDocField){
              return res.status(400).json({message: 'an error occured'});
            } else {
              workbook.properties.date1904 = true;
              Promise.all(promeses(resDocDef, resDocField)).then( function (fields) {
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
                          'text': `${field.text}`
                        },
                      ]
                    };
                    style = Object.create(cell.style); //shallow-clone the style, break references
                    fill = {
                      'type': 'pattern',
                      'pattern':'solid',
                      'fgColor': {'argb':'FFED1C24'}
                    };
                  }
                });
                workbook.xlsx.write(res);
              });
            }
          });
        });
      }
    });
  }
});

function promeses(resDocDef, resDocField) {
  return resDocField.map(async docField => {
    const resField = await Field.findById(docField.fieldId);
    if (resField) {
      var obj = {
        text: resField.custom,
        address: getFieldAddress(docField, resDocDef),
        worksheet: getFieldSheet(docField)
      };
      return obj;
    }
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

function getFieldAddress (docField, resDocDef) {
  if (docField.location === 'Header') {
    return String.fromCharCode(96 + docField.col).toUpperCase() + docField.row;
  } else if (docField.worksheet !== 'Sheet2') {
    return String.fromCharCode(96 + docField.col).toUpperCase() + resDocDef.row1;
  } else {
    return String.fromCharCode(96 + docField.col).toUpperCase() + resDocDef.row2;
  }
}

module.exports = router;