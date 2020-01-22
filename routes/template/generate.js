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
const Project = require('../../models/Project');
const Po = require('../../models/Po');
var Excel = require('exceljs');
fs = require('fs');
const stream = require('stream');


aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  
  const docDef = req.query.docDef;

    DocDef.findById(docDef, function(errDocField, resDocDef){
      if (errDocField) {
        return res.status(400).json({message: errDocField});
      } else if (!resDocDef) {
        return res.status(400).json({message: 'an error occured'});
      } else {
        Project.findById(resDocDef.projectId)
        .populate({
          path: 'pos',
          populate: {
              path: 'subs',
          }
        })
        .exec(function (errProject, resProject) {
          if (errProject) {
            return res.status(400).json({message: errProject});
          } else if (!resProject) {
            return res.status(400).json({message: 'an error occured'});
          } else {
            var s3 = new aws.S3();
            var params = {
                Bucket: awsBucketName,
                Key: path.join('templates', String(resProject.number), resDocDef.field),
            };
            var wb = new Excel.Workbook();
            wb.xlsx.read(s3.getObject(params).createReadStream())
            .then(workbook => {
              DocField.find({docdefId: docDef})
              .populate('fields')
              .exec(function(errDocField, resDocField){
                if (errDocField){
                  return res.status(400).json({message: 'an error occured'});
                } else {
                  // workbook.properties.date1904 = true;

                  const docFieldSol = filterDocFiled(resDocField, 'Sheet1', 'Line');
                  const firstColSol = getColumnFirst(docFieldSol);
                  const lastColSol = getColumnLast(docFieldSol);

                  const docFieldStl = filterDocFiled(resDocField, 'Sheet2', 'Line');
                  const firstColStl = getColumnFirst(docFieldStl);
                  const lastColStl = getColumnLast(docFieldStl);
                  

                  workbook.eachSheet(function(worksheet, sheetId) {

                    if (sheetId === 1) {
                      
                      if (!!firstColSol && !!lastColSol && !!resDocDef.row1) {
                        worksheet.addTable({
                          name: 'TableOne',
                          ref: alphabet(firstColSol) + (resDocDef.row1 - 1),
                          headerRow: true,
                          totalsRow: false,
                          columns: getColumns(resDocDef.row1, worksheet, firstColSol, lastColSol),
                          rows: getRows(resProject, docFieldSol, firstColSol,lastColSol)
                        });
                        hideHeader(resDocDef.row1, worksheet, firstColSol, lastColSol);
                        wsPageSetup(resDocDef.row1, worksheet, lastColSol);
                      }

                    } else if (sheetId === 2) {
                      
                      if (!!firstColStl && !!lastColStl && !!resDocDef.row2) {
                        worksheet.addTable({
                          name: 'TableTwo',
                          ref: alphabet(firstColStl) + (resDocDef.row2 - 1),
                          headerRow: true,
                          totalsRow: false,
                          columns: getColumns(resDocDef.row2, worksheet, firstColStl, lastColStl),
                          rows: getRows(resProject, docFieldStl, firstColStl,lastColStl)
                        });
                        hideHeader(resDocDef.row2, worksheet, firstColStl, lastColStl);
                        wsPageSetup(resDocDef.row2, worksheet, lastColStl);
                      }
                    }
                  });

                  workbook.xlsx.write(res);
                  // Promise.all(promeses(resDocDef, resDocField)).then( function (fields) {
                  //   fields.filter(n => n);
                  //   fields.map(field => {
                  //     const worksheet = getWorksheet(field.worksheet, workbook);
                  //     var cell = worksheet.getCell(`${field.address}`); 
                  //     with(cell){
                  //       value = {
                  //         'richText': [
                  //           {
                  //             'font': {
                  //               'size': 12,
                  //               'color': {'argb': 'FFFFFFFF'},
                  //               'name': 'Arial',
                  //               'scheme': 'minor'
                  //             },
                  //             'text': `${field.text}`
                  //           },
                  //         ]
                  //       };
                  //       style = Object.create(cell.style); //shallow-clone the style, break references
                  //       fill = {
                  //         'type': 'pattern',
                  //         'pattern':'solid',
                  //         'fgColor': {argb:'FFED1C24'}
                  //       };
                  //     }
                  //   });
                  //   workbook.xlsx.write(res);
                  // });
                }
              });
            });
          }
        });
      }
    });
});

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

function hideHeader(firstRow, ws, firstCol, lastCol){
  for (var i = firstCol; i < lastCol + 1 ; i++) {
    let cell = ws.getCell(alphabet(i) + (firstRow - 1));
    with(cell) {
      style = Object.create(cell.style), //shallow-clone the style, break references
      border ={
        left: {style:'none'},
        right: {style:'none'}                
      },
      fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor:{argb:'FFFFFFFF'}
      },
      font = {
        color: {'argb': 'FFFFFFFF'}
      }
    }
  }
}

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

function getColumns(firstRow, ws, firstCol, lastCol) {
  const arr = [];
  for (var i = firstCol; i < lastCol + 1 ; i++) {
    const style = ws.getCell(alphabet(i) + firstRow).style;
    var obj = {
      name: alphabet(i) + (firstRow - 1),
      filterButton: true,
      font: { 
        size: style.font.size, 
        name: style.font.name,
        family: style.font.family, 
      },
      style: {
        border: style.border,
        alignment: style.alignment,
      }      
    }
    arr.push(obj);
  };
  return arr;
}

function getRows (resProject, docField, firstCol, lastCol) {
  const arrayBody = [];
  arraySorted(resProject.pos, 'clPo', 'clPoRev', 'clPoItem').map(po => {
    if (po.subs) {
      po.subs.map(sub => {
        let arrayRow = [];
        for (var i = firstCol; i < lastCol + 1; i++){
          var filtered = docField.find(f => f.col === i);
          if (!filtered){
            arrayRow.push('');
          } else if (filtered.fields.fromTbl == 'po') {
            arrayRow.push(po[filtered.fields.name] === undefined ? '' : po[filtered.fields.name]);
          } else if (filtered.fields.fromTbl == 'sub') {
            arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);
          } else {
            arrayRow.push('');
          }
        }
        arrayBody.push(arrayRow);
      });
    }
  });
  return arrayBody;
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

function filterDocFiled(resDocField, sheet, location) {
  return resDocField.filter(f => {
    if (sheet === 'Sheet2') {
      return f.worksheet === 'Sheet2' && f.location === location;
    } else {
      return !f.worksheet != 'Sheet2' && f.location === location;
    }
  });
}

// function filterDocHeader(resDocField) {
//   return resDocField.filter(f => {
//       return f.worksheet === 'Sheet2' && f.location === 'Header';
//   });
// }

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
    return alphabet(docField.col) + docField.row;
  } else if (docField.worksheet !== 'Sheet2') {
    return alphabet(docField.col) + resDocDef.row1;
  } else {
    return alphabet(docField.col) + resDocDef.row2;
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

function resolve(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : null
  }, obj || self)
}

function arraySorted(array, fieldOne, fieldTwo, fieldThree) {
  if (array) {
      const newArray = array
      newArray.sort(function(a,b){
          if (resolve(fieldOne, a) < resolve(fieldOne, b)) {
              return -1;
          } else if (resolve(fieldOne, a) > resolve(fieldOne, b)) {
              return 1;
          } else if (fieldTwo && resolve(fieldTwo, a) < resolve(fieldTwo, b)) {
              return -1;
          } else if (fieldTwo && resolve(fieldTwo, a) > resolve(fieldTwo, b)) {
              return 1;
          } else if (fieldThree && resolve(fieldThree, a) < resolve(fieldThree, b)) {
              return -1;
          } else if (fieldThree && resolve(fieldThree, a) > resolve(fieldThree, b)) {
              return 1;
          } else {
              return 0;
          }
      });
      return newArray;             
  }
}




module.exports = router;