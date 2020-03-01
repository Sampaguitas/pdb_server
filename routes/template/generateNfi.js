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
const moment = require('moment');
const _ = require('lodash');


aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  const docDefId = req.query.id;
  const locale = req.query.locale;
  const selectedLocation = req.query.selectedLocation
  const inputNfi = req.query.inputNfi

  DocDef.findById(docDefId)
  .populate({
    path: 'docfields',
    populate: {
      path: 'fields'
    }
  })
  .populate({
    path: 'project',
    populate: [
      { 
        path: 'pos',
        options: {
          sort: {
            clPo: 'asc',
            clPoRev: 'asc',
            clPoItem: 'asc'
          }
        },
        populate: {
          path: 'subs',
          match: { nfi : inputNfi},
          populate: {
            path: 'certificates',
            options: {
                sort: { 
                    'cif': 'asc',
                    'heatNr': 'asc'
                }
            }
          }
        },
      },
      {
        path: 'suppliers',
        match: { _id : selectedLocation }
      }
    ]
  })
  .exec(function (err, docDef){
    if (err) {
      return res.status(400).json({message: 'An error has occured'});
    } else if (!docDef || !docDef.project) {
      return res.status(400).json({message: 'Could not retrive project information.'});
    } else {
      var s3 = new aws.S3();
      var params = {
          Bucket: awsBucketName,
          Key: path.join('templates', String(docDef.project.number), docDef.field),
      };
      var wb = new Excel.Workbook();
      wb.xlsx.read(s3.getObject(params).createReadStream())
      .then(function(workbook) {

        const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
        const docFieldSoh = filterDocFiled(docDef.docfields, 'Sheet1', 'Header');
        const firstColSol = getColumnFirst(docFieldSol);
        const lastColSol = getColumnLast(docFieldSol);
        const soh = getLines(docDef, docFieldSoh, locale);
        const sol = getLines(docDef, docFieldSol, locale);

        const docFieldStl = filterDocFiled(docDef.docfields, 'Sheet2', 'Line');
        const docFieldSth = filterDocFiled(docDef.docfields, 'Sheet2', 'Header');
        const firstColStl = getColumnFirst(docFieldStl);
        const lastColStl = getColumnLast(docFieldStl);
        const sth = getLines(docDef, docFieldSth, locale);
        const stl = getLines(docDef, docFieldStl, locale);

        
        
        workbook.eachSheet(function(worksheet, sheetId) {
          if (sheetId === 1 && sol && firstColSol && lastColSol) {
            //fill all headers first
            soh.map(function (head) {
              head.map(function (cell) {
                if (cell.col && cell.row && cell.val) {
                  worksheet.getCell(alphabet(cell.col) + cell.row).value = cell.val;
                }
              });
            });
            //insert as many rows as we have lines in our grid (keeping formulas and format of first row)
            //totals and headers suposed to be below our table will be shifted down...
            if (sol.length > 1) {
              worksheet.duplicateRow(docDef.row1, sol.length -1, true);
            }
            //fill all Lines from our grid in the inserted rows
            sol.map(function (line, lineIndex) {
              line.map(function (cell) {
                if (cell.col && cell.val) {
                  worksheet.getCell(alphabet(cell.col) + (docDef.row1 + lineIndex)).value = cell.val; 
                }
              });
            });
            //set up page for printing
            wsPageSetup(docDef.row1, worksheet, lastColSol);

          } else if (sheetId === 2 && stl && firstColStl && lastColStl) {
            //fill all headers first (second page)
            sth.map(function (head) {
              head.map(function (cell) {
                if (cell.col && cell.row && cell.val) {
                  worksheet.getCell(alphabet(cell.col) + cell.row).value = cell.val;
                }
              });
            });
            //insert as many rows as we have lines in our grid (keeping formulas and format of first row)
            //totals and headers suposed to be below our table will be shifted down...
            if (stl.length > 1) {
              worksheet.duplicateRow(docDef.row2, stl.length -1, true);
            }
            //fill all Lines from our grid in the inserted rows
            stl.map(function (line, lineIndex) {
              line.map(function (cell) {
                if (cell.col && cell.val) {
                  worksheet.getCell(alphabet(cell.col) + (docDef.row2 + lineIndex)).value = cell.val;
                }
              });
            });
            //set up page for printing
            wsPageSetup(docDef.row2, worksheet, lastColStl);
          }
        });
        workbook.xlsx.write(res);
      });

    }
  });
});

module.exports = router;


function filterDocFiled(docfields, sheet, location) {
  return docfields.filter(f => {
    if (sheet === 'Sheet2') {
      return f.worksheet === 'Sheet2' && f.location === location;
    } else {
      return !f.worksheet != 'Sheet2' && f.location === location;
    }
  });
}

function getColumnFirst (array) {
  if (array.length === 0) {
    return 0;
  } else {
    return array.reduce( (min, r) => r.col < min ? r.col : min, array[0].col);
  }
}

function getColumnLast(array){
  if (array.length === 0) {
    return 0;
  } else {
    return array.reduce( (min, r) => r.col > min ? r.col : min, array[0].col);
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

function wsPageSetup(firstRow, ws, lastCol) {
  var lastRow = ws.lastRow ? ws.lastRow._number : firstRow;
  ws.pageSetup = {
    orientation: 'landscape',
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: `A1:${alphabet(lastCol) + lastRow}`,
    margins: {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3    
    }
  }
}

function getDateFormat(locale) {
  
  const options = Intl.DateTimeFormat(locale, {'year': 'numeric', 'month': '2-digit', day: '2-digit'})
  const myLocale = Intl.DateTimeFormat(locale, options);

  let tempDateFormat = ''
  myLocale.formatToParts().map(function (element) {
      switch(element.type) {
          case 'month': 
              tempDateFormat = tempDateFormat + 'MM';
              break;
          case 'literal': 
              tempDateFormat = tempDateFormat + element.value;
              break;
          case 'day': 
              tempDateFormat = tempDateFormat + 'DD';
              break;
          case 'year': 
              tempDateFormat = tempDateFormat + 'YYYY';
              break;
      }
  });
  return tempDateFormat;
}

function TypeToString(fieldValue, fieldType, locale) {
  if (fieldValue) {
      switch (fieldType) {
          case 'Date': return String(moment(fieldValue).format(getDateFormat(locale)));
          case 'Number': return String(new Intl.NumberFormat(locale).format(fieldValue)); 
          default: return fieldValue;
      }
  } else {
      return '';
  }
}

function getTables(docfields) {
  return docfields.reduce(function (acc, curr) {
      if(!acc.includes(curr.fields.fromTbl)) {
          acc.push(curr.fields.fromTbl)
      }
      return acc;
  },[]);
}

function getCertificateFields (docFileds) {
  if (docFileds) {
      let tempArray = [];
      docFileds.reduce(function (acc, curr) {
          if (curr.fields.fromTbl === 'certificate' && !acc.includes(curr.fields._id)) {
              tempArray.push(curr.fields);
              acc.push(curr.fields._id);
          }
          return acc;
      },[]);
      return tempArray;
  } else {
      return [];
  }
}

function getLines(docDef, docfields, locale) {
  let arrayLines = [];
  let arrayRow = [];
  let hasCertificates = getTables(docfields).includes('certificate');
  if(docDef.project.pos) {
    docDef.project.pos.map(po => {
      if(po.subs){
        po.subs.map(sub => {
          if(!_.isEmpty(sub.certificates) && hasCertificates) {
            virtuals(sub.certificates, getCertificateFields(docfields), locale).map(virtual => {
              arrayRow = [];
              docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
                  case 'project':
                      arrayRow.push({
                        val: docDef.project[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    break;
                  case 'supplier':
                    if (docDef.project.suppliers) {
                      let supplier = docDef.project.suppliers[0];
                      arrayRow.push({
                        val: supplier[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                    break;
                  case 'po':
                    arrayRow.push({
                      val: po[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                    break;
                  case 'sub':
                    arrayRow.push({
                      val: sub[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                    break;
                  case 'certificate':
                    arrayRow.push({
                      val: virtual[docfield.fields.name].join(' | ') || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: 'String'
                    });
                    break;
                  default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
                    name: docfield.fields.name,
                    type: 'String'
                  });
                }
              });
              arrayLines.push(arrayRow);
            });
          } else {
            arrayRow = [];
            docfields.map(docfield => {
              switch(docfield.fields.fromTbl) {
                case 'project':
                  arrayRow.push({
                    val: docDef.project[docfield.fields.name] || '',
                    row: docfield.row,
                    col: docfield.col,
                    type: docfield.fields.type
                  });
                  break;
                case 'supplier':
                  if (docDef.project.suppliers) {
                    let supplier = docDef.project.suppliers[0];
                    arrayRow.push({
                      val: supplier[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                  }
                  break;
                case 'po':
                  arrayRow.push({
                    val: po[docfield.fields.name] || '',
                    row: docfield.row,
                    col: docfield.col,
                    type: docfield.fields.type
                  });
                  break;
                case 'sub':
                  arrayRow.push({
                    val: sub[docfield.fields.name] || '',
                    row: docfield.row,
                    col: docfield.col,
                    type: docfield.fields.type
                  });
                  break;
                default: arrayRow.push({
                  val: '',
                  row: docfield.row,
                  col: docfield.col,
                  name: docfield.fields.name,
                  type: 'String'
                });
              }
            });
            arrayLines.push(arrayRow);
          }
        });
      }
    });
    return arrayLines;
  }
}
//locale
function virtuals(certificates, certificateFields, locale) {
  let tempVirtuals = [];
  let tempObject = {_id: '0'}
  certificates.map(function (certificate){
      certificateFields.map(function (certificateField) {
          if (!tempObject.hasOwnProperty(certificateField.name)) {
              tempObject[certificateField.name] = [TypeToString(certificate[certificateField.name], certificateField.type, locale)]
          } else if(!tempObject[certificateField.name].includes(TypeToString(certificate[certificateField.name], certificateField.type, locale))) {
              tempObject[certificateField.name].push(TypeToString(certificate[certificateField.name], certificateField.type, locale));
          }
      });
  });
  tempVirtuals.push(tempObject);
  return tempVirtuals;
}












