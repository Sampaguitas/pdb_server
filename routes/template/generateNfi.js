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
  const selectedLocation = req.query.selectedLocation || '000000000000000000000000';
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
        populate: [
          {
            path: 'subs',
            match: { nfi : inputNfi},
            populate: [
              {
                path: 'packitems',
                options: {
                  sort: { 
                    'plNr': 'asc',
                    'colliNr': 'asc'
                  }
                }
              },
              {
                path: 'heats',
                options: {
                    sort: {
                        heatNr: 'asc'
                    }
                },
                populate: {
                    path: 'certificate',
                }
              }
            ]
          }
        ]
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
        const lastColSol = getColumnLast(docFieldSol, docDef.col1);
        const soh = getLines(docDef, docFieldSoh, locale);
        const sol = getLines(docDef, docFieldSol, locale);

        const docFieldStl = filterDocFiled(docDef.docfields, 'Sheet2', 'Line');
        const docFieldSth = filterDocFiled(docDef.docfields, 'Sheet2', 'Header');
        const firstColStl = getColumnFirst(docFieldStl);
        const lastColStl = getColumnLast(docFieldStl, docDef.col2);
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

function getColumnLast(array, lastCol){
  if (!!lastCol) {
      return lastCol;
  } else if (array.length != 0) {
      return array.reduce( (min, r) => r.col > min ? r.col : min, array[0].col);
  } else {
      return 0;
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
    // orientation: 'landscape',
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
  // let hasCertificates = getTables(docfields).includes('certificate');
  let hasPackitems = getTables(docfields).includes('packitem');
  if(docDef.project.pos) {
    docDef.project.pos.map(po => {
      if(po.subs){
        po.subs.map(sub => {
          let certificate = sub.heats.reduce(function (acc, cur) {
            if (!acc.heatNr.split(' | ').includes(cur.heatNr)) {
              acc.heatNr = !acc.heatNr ? cur.heatNr : `${acc.heatNr} | ${cur.heatNr}`
            }
            if (!acc.cif.split(' | ').includes(cur.certificate.cif)) {
              acc.cif = !acc.cif ? cur.certificate.cif : `${acc.cif} | ${cur.certificate.cif}`
            }
            if (!acc.inspQty.split(' | ').includes(cur.inspQty)) {
              acc.inspQty = !acc.inspQty ? cur.inspQty : `${acc.inspQty} | ${cur.inspQty}`
            }
            return acc;
          }, {
              heatNr: '',
              cif: '',
              inspQty: ''
          });
          // if(!_.isEmpty(sub.certificates) && hasCertificates) {
          if(!_.isEmpty(sub.packitems) && hasPackitems) {
            // virtuals(sub.certificates, getCertificateFields(docfields), locale).map(virtual => {
            virtuals(sub.packitems, po.uom, getPackItemFields(docfields), locale).map(virtual => {
              arrayRow = [];
              docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
                  case 'supplier':
                    if (docDef.project.suppliers) {
                      let supplier = docDef.project.suppliers[0];
                      if (!_.isUndefined(supplier)) {
                        arrayRow.push({
                          val: supplier[docfield.fields.name] || '',
                          row: docfield.row,
                          col: docfield.col,
                          type: docfield.fields.type
                        });
                      } else {
                        arrayRow.push({
                          val: '',
                          row: docfield.row,
                          col: docfield.col,
                          type: docfield.fields.type
                        });
                      }
                    }
                    break;
                  case 'po':
                    if (['project', 'projectNr'].includes(docfield.fields.name)) {
                      arrayRow.push({
                        val: docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: po[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                    break;
                  case 'sub':
                    if(docfield.fields.name === 'shippedQty') {
                      arrayRow.push({
                        val: virtual.shippedQty || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else if (docfield.fields.name === 'heatNr') {
                      arrayRow.push({
                        val: certificate[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: sub[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                    break;
                  case 'certificate':
                    arrayRow.push({
                      val: certificate[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                    break;
                  case 'packitem':
                    if(docfield.fields.name === 'plNr') {
                      arrayRow.push({
                        val: virtual.plNr || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: virtual[docfield.fields.name].join(' | ') || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: 'String'
                      });
                    }
                    break;
                  default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
                    // name: docfield.fields.name,
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
                case 'supplier':
                  if (docDef.project.suppliers) {
                    let supplier = docDef.project.suppliers[0];
                    if (!_.isUndefined(supplier)) {
                      arrayRow.push({
                        val: supplier[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                  }
                  break;
                case 'po':
                  if (['project', 'projectNr'].includes(docfield.fields.name)) {
                    arrayRow.push({
                      val: docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                  } else {
                    arrayRow.push({
                      val: po[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                  }
                  break;
                case 'sub':
                  if(docfield.fields.name === 'shippedQty') {
                    arrayRow.push({
                      val: '',
                      row: docfield.row,
                      col: docfield.col,
                      type: 'String'
                    });
                  } else if (docfield.fields.name === 'heatNr') {
                    arrayRow.push({
                      val: certificate[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                  } else {
                    arrayRow.push({
                      val: sub[docfield.fields.name] || '',
                      row: docfield.row,
                      col: docfield.col,
                      type: docfield.fields.type
                    });
                  }
                  break;
                case 'certificate':
                  arrayRow.push({
                    val: certificate[docfield.fields.name] || '',
                    row: docfield.row,
                    col: docfield.col,
                    type: docfield.fields.type
                  });
                  break;
                default: arrayRow.push({
                  val: '',
                  row: docfield.row,
                  col: docfield.col,
                  // name: docfield.fields.name,
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
// function virtuals(certificates, certificateFields, locale) {
//   let tempVirtuals = [];
//   let tempObject = {_id: '0'}
//   certificates.map(function (certificate){
//       certificateFields.map(function (certificateField) {
//           if (!tempObject.hasOwnProperty(certificateField.name)) {
//               tempObject[certificateField.name] = [TypeToString(certificate[certificateField.name], certificateField.type, locale)]
//           } else if(!tempObject[certificateField.name].includes(TypeToString(certificate[certificateField.name], certificateField.type, locale))) {
//               tempObject[certificateField.name].push(TypeToString(certificate[certificateField.name], certificateField.type, locale));
//           }
//       });
//   });
//   tempVirtuals.push(tempObject);
//   return tempVirtuals;
// }

function virtuals(packitems, uom, packItemFields, locale) {
  let tempVirtuals = [];
  let tempUom = ['M', 'MT', 'MTR', 'MTRS', 'F', 'FT', 'FEET', 'LM'].includes(uom.toUpperCase()) ? 'mtrs' : 'pcs';
  if (hasPackingList(packItemFields)) {
    packitems.reduce(function (acc, cur){
        if (cur.plNr){
            if (!acc.includes(cur.plNr)) {

                let tempObject = {};
                tempObject['shippedQty'] = cur[tempUom];
                packItemFields.map(function (packItemField) {
                    if (packItemField.name === 'plNr') {
                        tempObject['plNr'] = cur['plNr'];
                        tempObject['_id'] = cur['plNr'];
                    } else {
                        tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)]
                    }               
                });
                tempVirtuals.push(tempObject);
                acc.push(cur.plNr);
                
            } else if (acc.includes(cur.plNr)) {
    
                let tempVirtual = tempVirtuals.find(element => element.plNr === cur.plNr);            
                tempVirtual['shippedQty'] += cur[tempUom];
                packItemFields.map(function (packItemField) {
                    if (packItemField.name != 'plNr' && !tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                        tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                    }               
                });
                // acc.push(cur.plNr);
            }
          } else if (!acc.includes('0')) {
            let tempObject = {_id: '0'}
            tempObject['shippedQty'] = '';
            packItemFields.map(function (packItemField) {
              if (packItemField.name === 'plNr') {
                  tempObject['plNr'] = ''
              } else {
                  tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
              }
            });
            tempVirtuals.push(tempObject);
            acc.push('0');
          } else {
            let tempVirtual = tempVirtuals.find(element => element._id === '0');
            packItemFields.map(function (packItemField) {
                if (packItemField.name != 'plNr' && !tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                    tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                }               
            });
          }
        return acc;
    }, []);
  } else {
    packitems.reduce(function(acc, cur) {
      if (cur.plNr){
          if (!acc.includes('1')) {
              let tempObject = {_id: '1'}
              tempObject['shippedQty'] = cur[tempUom];
              packItemFields.map(function (packItemField) {
                  tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
              });
              tempVirtuals.push(tempObject);
              acc.push('1');
          } else {
              let tempVirtual = tempVirtuals.find(element => element._id === '1');
              tempVirtual['shippedQty'] += cur[tempUom];
              packItemFields.map(function (packItemField) {
                  if (!tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                      tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                  }
              });
          }
      } else {
          if (!acc.includes('0')) {
              let tempObject = {_id: '0'}
              packItemFields.map(function (packItemField) {
                  tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
              });
              tempVirtuals.push(tempObject);
              acc.push('0');
          } else {
              let tempVirtual = tempVirtuals.find(element => element._id === '0');
              packItemFields.map(function (packItemField) {
                  if (!tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                      tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                  }
              });
          }
      }
      return acc;
    }, [])
  }
  return tempVirtuals;
}












