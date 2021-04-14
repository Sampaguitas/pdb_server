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

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  const docDefId = req.query.id;
  const locale = req.query.locale;
  const selectedIds = req.body.selectedIds;

  let poIds = [];
  let subIds = [];
  let heatIds= [];
  let returnIds = [];

  selectedIds.forEach(element => {
    element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
    element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
    element.heatId && !heatIds.includes(element.heatId) && subIds.push(element.heatId);
    element.returnId && !returnIds.includes(element.returnId) && subIds.push(element.returnId);
  });

  DocDef.findById(docDefId)
  .populate([
    {
      path: 'docfields',
      populate: {
        path: 'fields'
      }
    },
    {
      path: 'project',
      populate: { 
        path: 'pos',
        match: { _id: { $in : poIds } },
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
            match: { _id: { $in : subIds } },
            populate: {
              path: 'heats',
              match: { _id: { $in : heatIds } },
              options: {
                  sort: {
                      heatNr: 'asc'
                  }
              },
              populate: {
                  path: 'certificate',
              }
            }
          },
          {
            path: 'returns',
            match: { _id: { $in : returnIds } },
            populate: {
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
          }
        ]
      }
    }
  ])
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

function getLines(docDef, docfields, locale) {
  let arrayLines = [];
  let arrayRow = [];
  if(docDef.project.pos) {
    docDef.project.pos.map(po => {
      if(po.subs){
        po.subs.map(sub => {
          if (po.subs.heats) {
            po.subs.heats.map(heat => {
              arrayRow = [];
              docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
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
                        type: docfield.fields.type
                      });
                    } else if (docfield.fields.name === 'heatNr') {
                      arrayRow.push({
                        val: heat[docfield.fields.name] || '',
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
                    if(docfield.fields.name === 'cif') {
                      arrayRow.push({
                        val: heat.certificate[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: heat[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                    break;
                  default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
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
                      type: docfield.fields.type
                    });
                  } else if (docfield.fields.name === 'heatNr') {
                    arrayRow.push({
                      val: '',
                      row: docfield.row,
                      col: docfield.col,
                      type: 'String'
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
                default: arrayRow.push({
                  val: '',
                  row: docfield.row,
                  col: docfield.col,
                  type: 'String'
                });
              }
            });
            arrayLines.push(arrayRow);
          }
        });
      }

      if (po.returns) {
        po.returns.map(_return => {
          if(_return.heats) {
            _return.heats.map(heat => {
              arrayRow = [];
              docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
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
                    if (docfield.fields.name === 'heatNr') {
                      arrayRow.push({
                        val: heat[docfield.fields.name] || '',
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
                    break;
                  case 'certificate':
                    if(docfield.fields.name === 'cif') {
                      arrayRow.push({
                        val: heat.certificate[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    } else {
                      arrayRow.push({
                        val: heat[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                      });
                    }
                    break;
                  default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
                    type: 'String'
                  });
                }
              });
              arrayLines.push(arrayRow);
            });
          }
        });
      }
    });
  }
  return arrayLines;
}












