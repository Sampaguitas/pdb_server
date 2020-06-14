var express = require('express');
const router = express.Router();
var aws = require('aws-sdk');
var path = require('path');
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;
const DocDef = require('../../models/DocDef');
const Article = require('../../models/Article');
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
  const docDefId = req.query.docDefId;
  const locale = req.query.locale;
  const selectedPl = req.query.selectedPl;
    
    DocDef
    .findById(docDefId)
    .populate([
        {
            path: 'docfields',
            populate: {
                path: 'fields'
            }
        },
        {
            path: 'project',
            populate: [
                {
                    path: 'erp',
                },
                {
                    path: 'collipacks',
                    match: { plNr: selectedPl },
                    options: {
                        sort: {
                            plNr: 'asc',
                            colliNr: 'asc',
                        }
                    },
                    populate: {
                        path: 'packitems',
                        populate: {
                            path: 'sub',
                            populate: [
                                {
                                    path: 'po',
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
                    }
                }
            ]
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
                //1) delete extra pages
                workbook.eachSheet(function(worksheet, sheetId) {
                    if (sheetId != 1) {
                        workbook.removeWorksheet(sheetId);
                    }
                });
                
                if (!_.isEmpty(docDef.project.collipacks)) {
                    var firstSheet = '';
                    let rowCount = 0;
                    let columnCount = 0;
                    
                    docDef.project.collipacks.map(function (collipack, indexColli) {
                        //2) add colli pages
                        if (indexColli === 0) {
                            firstSheet = workbook.getWorksheet(1);
                            firstSheet.name = docDef.project.collipacks[0].colliNr;
                            rowCount = firstSheet.rowCount;
                            columnCount = firstSheet.columnCount;
                        } else {
                            workbook.addWorksheet(collipack.colliNr);
                            for (var col = 1; col < columnCount + 1; col++) {
                                workbook.getWorksheet(collipack.colliNr).getColumn(col).width = firstSheet.getColumn(col).width;
                                for (var row = 1; row < rowCount + 1; row++) {
                                    workbook.getWorksheet(collipack.colliNr).getRow(row).height = firstSheet.getRow(row).height;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).value = firstSheet.getCell(alphabet(col) + row).value;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).numFmt = firstSheet.getCell(alphabet(col) + row).numFmt;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).font = firstSheet.getCell(alphabet(col) + row).font;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).alignment = firstSheet.getCell(alphabet(col) + row).alignment;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).border = firstSheet.getCell(alphabet(col) + row).border;
                                    workbook.getWorksheet(collipack.colliNr).getCell(alphabet(col) + row).fill = firstSheet.getCell(alphabet(col) + row).fill;
                                }
                            }
                        }
                        //3) fill colli pages
                        collipack.packitems.map(packitem => {
                            let certificate = packitem.sub.heats.reduce(function (acc, cur) {
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
                            docDef.docfields.map(docfield => {
                                switch(docfield.fields.fromTbl) {
                                    case 'collipack': workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = collipack[docfield.fields.name] || '';
                                        break;
                                    case 'packitem': workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = packitem[docfield.fields.name] || '';
                                        break;
                                    case 'sub': 
                                        if(docfield.fields.name === 'heatNr') {
                                            workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = certificate[docfield.fields.name] || '';
                                        } else {
                                            workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = packitem.sub[docfield.fields.name] || '';
                                        }
                                        break;
                                    case 'certificate': workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = certificate[docfield.fields.name] || '';
                                        break;
                                    case 'po': 
                                        if (['project', 'projectNr'].includes(docfield.fields.name)) {
                                            workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '';
                                        } else {
                                            workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = packitem.sub.po[docfield.fields.name] || '';
                                        }    
                                    break;
                                    default: workbook.getWorksheet(collipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = '';
                                }
                            });
                        });
                        //set up page for printing
                        const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
                        // const lastColSol = getColumnLast(docFieldSol);
                        const lastColSol = getColumnLast(docFieldSol, docDef.col1);
                        wsPageSetup(docDef.row1, workbook.getWorksheet(collipack.colliNr), lastColSol);
                    });
                }
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














