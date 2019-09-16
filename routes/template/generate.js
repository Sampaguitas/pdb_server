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
            // console.log('resPo:', JSON.stringify(resProject));
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
                  workbook.properties.date1904 = true;
                  // const wsOne = workbook.getWorksheet(1);

                  const docFieldSol = filterDocFiled(resDocField, 'Sheet1', 'Line')
                  const firstColSol = getColumnFirst(docFieldSol);
                  const lastColSol = getColumnLast(docFieldSol);
                  const colSol = getColumns(resDocDef.row1, workbook.getWorksheet(1), firstColSol, lastColSol);
                  const rowSol = getRows(resProject, docFieldSol, firstColSol,lastColSol);
                  workbook.eachSheet(function(worksheet, sheetId) {
                    console.log('sheetId:', sheetId);
                  });
                  workbook.getWorksheet(1).addTable({
                    name: 'TableOne',
                    ref: alphabet(firstColSol) + (resDocDef.row1 - 1),
                    headerRow: false,
                    totalsRow: false,
                    columns: colSol,
                    rows: rowSol
                  });

                  // workbook.getWorksheet(2).addTable({
                  //   name: 'TableTwo',
                  //   ref: alphabet(firstColSol) + (resDocDef.row1 - 1),
                  //   headerRow: false,
                  //   totalsRow: false,
                  //   columns: colSol,
                  //   rows: rowSol
                  // });

                  // const table = ws.getTable('MyTable');
                  // table.style = Object.create(table.style);
                  // table.commit();
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
    var obj = {
      name: alphabet(i) + firstRow,
      filterButton: true,
      style: ws.getCell(alphabet(i) + firstRow).style      
    }
    arr.push(obj);
  };
  return arr;
}

function getRows (resProject, docField, firstCol, lastCol) {
  const arrayBody = [];
  arrayBody.push(Array.from( {length: lastCol-firstCol+1} , () => ''));
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
            // switch(filtered.fields.type) {
            //   case "String":
            //     arrayRow.push(po[filtered.fields.name] === undefined ? '' : po[filtered.fields.name]);
            //     break;
            //   case "Number":
            //     arrayRow.push(po[filtered.fields.name] === undefined ? '' : po[filtered.fields.name]);
            //     break;
            //   case "Date":
            //     arrayRow.push(po[filtered.fields.name] === undefined ? '' : po[filtered.fields.name]);
            //     break;
            //   default:
            //   arrayRow.push(po[filtered.fields.name] === undefined ? '' : po[filtered.fields.name]);  
            // }
          } else if (filtered.fields.fromTbl == 'sub') {
            arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);
            // switch(filtered.fields.type) {
            //   case "String":
            //     arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);
            //     break;
            //   case "Number":
            //     arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);
            //     break;
            //   case "Date":
            //     arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);
            //     break;
            //   default:
            //   arrayRow.push(sub[filtered.fields.name] === undefined ? '' : sub[filtered.fields.name]);  
            // }
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