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
                    path: 'whcollipacks',
                    match: { plNr: selectedPl },
                    options: {
                        sort: {
                            plNr: 'asc',
                            colliNr: 'asc',
                        }
                    },
                    populate: {
                        path: 'whpackitems',
                        populate: {
                            path: 'pickitem',
                            populate: [
                                {
                                    path: 'miritem',
                                    populate: [
                                        {
                                            path: 'po'
                                        },
                                        {
                                            path: 'mir'
                                        },
                                    ]
                                },
                                {
                                    path: 'heatpicks',
                                    populate: {
                                        path: 'heatloc',
                                    }
                                },
                                {
                                    path: 'pickticket'
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
                
                if (!_.isEmpty(docDef.project.whcollipacks)) {
                    var firstSheet = '';
                    let rowCount = 0;
                    let columnCount = 0;
                    
                    docDef.project.whcollipacks.map(function (whcollipack, indexColli) {
                        //2) add colli pages
                        if (indexColli === 0) {
                            firstSheet = workbook.getWorksheet(1);
                            firstSheet.name = docDef.project.whcollipacks[0].colliNr;
                            rowCount = firstSheet.rowCount;
                            columnCount = firstSheet.columnCount;
                        } else {
                            workbook.addWorksheet(whcollipack.colliNr);
                            for (var col = 1; col < columnCount + 1; col++) {
                                workbook.getWorksheet(whcollipack.colliNr).getColumn(col).width = firstSheet.getColumn(col).width;
                                for (var row = 1; row < rowCount + 1; row++) {
                                    workbook.getWorksheet(whcollipack.colliNr).getRow(row).height = firstSheet.getRow(row).height;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).value = firstSheet.getCell(alphabet(col) + row).value;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).numFmt = firstSheet.getCell(alphabet(col) + row).numFmt;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).font = firstSheet.getCell(alphabet(col) + row).font;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).alignment = firstSheet.getCell(alphabet(col) + row).alignment;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).border = firstSheet.getCell(alphabet(col) + row).border;
                                    workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(col) + row).fill = firstSheet.getCell(alphabet(col) + row).fill;
                                }
                            }
                        }
                        //3) fill colli pages
                        whcollipack.whpackitems.map(whpackitem => {
                            let certificate = whpackitem.pickitem.heatpicks.reduce(function (acc, cur) {
                                if (!acc.heatNr.split(' | ').includes(cur.heatloc.heatNr)) {
                                    acc.heatNr = !acc.heatNr ? cur.heatloc.heatNr : `${acc.heatNr} | ${cur.heatloc.heatNr}`
                                }
                                if (!acc.cif.split(' | ').includes(cur.heatloc.cif)) {
                                    acc.cif = !acc.cif ? cur.heatloc.cif : `${acc.cif} | ${cur.heatloc.cif}`
                                }
                                if (!acc.inspQty.split(' | ').includes(String(cur.inspQty))) {
                                    acc.inspQty = !acc.inspQty ? String(cur.inspQty) : `${acc.inspQty} | ${String(cur.inspQty)}`
                                }
                                return acc;
                            }, {
                                heatNr: '',
                                cif: '',
                                inspQty: ''
                            });
                            docDef.docfields.map(docfield => {
                                switch(docfield.fields.fromTbl) {
                                    case 'collipack': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whcollipack[docfield.fields.name] || '';
                                        break;
                                    case 'packitem': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem[docfield.fields.name] || '';
                                        break;
                                    case 'pickitem': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem.pickitem[docfield.fields.name] || '';
                                        break;
                                    case 'miritem': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem.pickitem.miritem[docfield.fields.name] || '';
                                        break;
                                    case 'po': 
                                        if (['project', 'projectNr'].includes(docfield.fields.name)) {
                                            workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '';
                                        } else {
                                            workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem.pickitem.miritem.po[docfield.fields.name] || '';
                                        }    
                                        break;
                                    case 'mir': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem.pickitem.miritem.mir[docfield.fields.name] || '';
                                        break;
                                    case 'certificate': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = certificate[docfield.fields.name] || '';
                                        break;
                                    case 'pickticket': workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = whpackitem.pickitem.pickticket[docfield.fields.name] || '';
                                        break;
                                    default: workbook.getWorksheet(whcollipack.colliNr).getCell(alphabet(docfield.col) + docfield.row).value = '';
                                }
                            });
                        });
                        //set up page for printing
                        const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
                        // const lastColSol = getColumnLast(docFieldSol);
                        const lastColSol = getColumnLast(docFieldSol, docDef.col1);
                        wsPageSetup(docDef.row1, workbook.getWorksheet(whcollipack.colliNr), lastColSol);
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