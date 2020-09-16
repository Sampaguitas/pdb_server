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
            .then(async function(workbook) {

                // console.log('--------------------------');
                // console.log(docDef.project.collipacks);

                let spColli = docDef.project.collipacks.reduce(function(acc, cur) {
                    if (!!cur.type && !acc.hasOwnProperty(cur.type.toUpperCase())){
                        acc[cur.type.toUpperCase()] = { spColliQty: 1, spColliWeight: cur.totWeight || 0 }
                    } else if (!!cur.type && acc.hasOwnProperty(cur.type.toUpperCase())){
                        acc[cur.type.toUpperCase()].spColliQty += 1;
                        acc[cur.type.toUpperCase()].spColliWeight += cur.totWeight || 0;
                    }
                    return acc;
                }, {});

                const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
                const docFieldSoh = filterDocFiled(docDef.docfields, 'Sheet1', 'Header');
                const firstColSol = getColumnFirst(docFieldSol);
                const lastColSol = getColumnLast(docFieldSol, docDef.col1);
                const soh = await getLines(docDef, docFieldSoh, locale, spColli);
                const sol = await getLines(docDef, docFieldSol, locale, spColli);

                const docFieldStl = filterDocFiled(docDef.docfields, 'Sheet2', 'Line');
                const docFieldSth = filterDocFiled(docDef.docfields, 'Sheet2', 'Header');
                const firstColStl = getColumnFirst(docFieldStl);
                const lastColStl = getColumnLast(docFieldStl, docDef.col2);
                const sth = await getLines(docDef, docFieldSth, locale, spColli);
                const stl = await getLines(docDef, docFieldStl, locale, spColli);

                workbook.eachSheet(function(worksheet, sheetId) {
                    if (sheetId === 1 && docDef.row1 && !_.isEmpty(sol)) {
                        //fill all headers first
                        soh.map(function (head) {
                            head.map(function (cell) {
                                if (cell.col && cell.row && cell.val) {
                                    worksheet.getCell(alphabet(cell.col) + cell.row).value = cell.val;
                                }
                            });
                        });
                        //get nLines and nRows per line
                        let columnCount = worksheet.columnCount;
                        let startRow = docDef.row1;
                        let nLines = sol.length;
                        let nRows = sol.reduce(function(accLine, curLine) {
                            let nRowLine = curLine.reduce(function(accCell, curCell) {
                                if(curCell.row > accCell) {
                                  accCell = curCell.row;
                                }
                              return accCell;
                            }, 1);
                            
                            if(nRowLine > accLine) {
                              accLine = nRowLine;
                            }
                              return accLine;
                        }, 1);
                        
                        //insert as many rows as we have line item * rows in our grid starting (keeping formulas and format of the last row from the first line)
                        //starting from the last row of our first line item
                        worksheet.duplicateRow(startRow + nRows - 1, nRows * (nLines - 1) , true);
                        //copy the formulas from each row of the first line item to the other line items
                        for (var col = 1; col < columnCount + 1; col++) {
                            for (var line = 1; line < nLines; line++) {
                                for (var row = 0; row < nRows; row++) {
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).value = worksheet.getCell(alphabet(col) + (startRow + row)).value;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).numFmt = worksheet.getCell(alphabet(col) + (startRow + row)).numFmt;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).font = worksheet.getCell(alphabet(col) + (startRow + row)).font;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).alignment = worksheet.getCell(alphabet(col) + (startRow + row)).alignment;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).border = worksheet.getCell(alphabet(col) + (startRow + row)).border;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).fill = worksheet.getCell(alphabet(col) + (startRow + row)).fill;
                                }
                            }
                        }
                        //fill all Lines from our grid in the inserted rows
                        sol.map(function (line, lineIndex) {
                            line.map(function (cell) {
                                if (cell.col && cell.val) {
                                    worksheet.getCell(alphabet(cell.col) + (startRow + (nRows * lineIndex) + cell.row - 1)).value = cell.val; 
                                }
                            });
                        });
                        // set up page for printing
                        wsPageSetup(docDef.row1, worksheet, lastColSol);
                    } else if (sheetId === 2 && docDef.row2 && !_.isEmpty(stl)) {
                        // fill all headers first (second page)
                        sth.map(function (head) {
                            head.map(function (cell) {
                                if (cell.col && cell.row && cell.val) {
                                    worksheet.getCell(alphabet(cell.col) + cell.row).value = cell.val;
                                }
                            });
                        });
                        //get nLines and nRows per line
                        let columnCount = worksheet.columnCount;
                        let startRow = docDef.row2;
                        let nLines = stl.length;
                        let nRows = stl.reduce(function(accLine, curLine) {
                            let nRowLine = curLine.reduce(function(accCell, curCell) {
                                if(curCell.row > accCell) {
                                accCell = curCell.row;
                                }
                            return accCell;
                            }, 1);
                            
                            if(nRowLine > accLine) {
                            accLine = nRowLine;
                            }
                            return accLine;
                        }, 1);
                        //insert as many rows as we have line item * rows in our grid starting (keeping formulas and format of the last row from the first line)
                        //starting from the last row of our first line item
                        worksheet.duplicateRow(startRow + nRows - 1, nRows * (nLines - 1) , true);
                        //copy the formulas from each row of the first line item to the other line items
                        for (var col = 1; col < columnCount + 1; col++) {
                            for (var line = 1; line < nLines; line++) {
                                for (var row = 0; row < nRows; row++) {
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).value = worksheet.getCell(alphabet(col) + (startRow + row)).value;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).numFmt = worksheet.getCell(alphabet(col) + (startRow + row)).numFmt;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).font = worksheet.getCell(alphabet(col) + (startRow + row)).font;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).alignment = worksheet.getCell(alphabet(col) + (startRow + row)).alignment;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).border = worksheet.getCell(alphabet(col) + (startRow + row)).border;
                                    worksheet.getCell(alphabet(col) + (startRow + (nRows * line + row))).fill = worksheet.getCell(alphabet(col) + (startRow + row)).fill;
                                }
                            }
                        }
                        //fill all Lines from our grid in the inserted rows
                        stl.map(function (line, lineIndex) {
                            line.map(function (cell) {
                                if (cell.col && cell.val) {
                                    worksheet.getCell(alphabet(cell.col) + (startRow + (nRows * lineIndex) + cell.row - 1)).value = cell.val; 
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
  } else if(array.length != 0) {
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
  
    const options = {'year': 'numeric', 'month': '2-digit', day: '2-digit', timeZone: 'GMT'};
    let tempDateFormat = '';
    
    Intl.DateTimeFormat(locale, options).formatToParts().map(function (element) {
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
          case 'Date': return String(moment.utc(fieldValue).format(getDateFormat(locale)));
          case 'Number': return String(new Intl.NumberFormat(locale).format(fieldValue)); 
          default: return fieldValue;
      }
  } else {
      return '';
  }
}

//---group(1)----params row: 1 or 2 or 3....
//po.description
//po.material
//---display(1)---

//---group(2)----params row: 1 or 2 or 3....
//po.size
//po.sch
//---display(2)---

// function getGroups(docfields) {

// }

function getLines(docDef, docfields, locale, spColli) {
    return new Promise(async function (resolve) {
        // let arrayLines = [];
        // let arrayRow = [];
        let myRowPromises = [];
        let arrayColli = [];

        if(docDef.project.collipacks) {
            
            docDef.project.collipacks.map(collipack => {
                // console.log('collipack.packitems:', collipack.packitems);
                if(collipack.packitems){
                    collipack.packitems.map(function (packitem, itemIndex) {
                        myRowPromises.push(getRows(docDef, docfields, collipack, packitem, itemIndex, spColli));
                    });
                }
            });

            await Promise.all(myRowPromises).then(arrayLines => {
                resolve(arrayLines);
            });

        } else {
            resolve([]);
        }

    });
}

function getRows(docDef, docfields, collipack, packitem, itemIndex, spColli) {
    return new Promise(function(resolve) {
        let arrayLine = [];
        
        let tempUom = 'pcs';
        if (!!packitem.sub.po.uom && ['M', 'MT', 'MTR', 'MTRS', 'LM'].includes(packitem.sub.po.uom.toUpperCase())) {
            tempUom = 'mtrs';
        } else if (!!packitem.sub.po.uom && ['F', 'FT', 'FEET', 'FEETS'].includes(packitem.sub.po.uom.toUpperCase())) {
            tempUom = 'feets';
        } else if (!!packitem.sub.po.uom && packitem.sub.po.uom.toUpperCase() === 'MT') {
            tempUom = 'mt';
        }

        getArticle(docDef.project.erp.name, packitem.sub.po.vlArtNo, packitem.sub.po.vlArtNoX).then(article => {
            let certificate = packitem.sub.heats.reduce(function (acc, cur) {
                if (!acc.heatNr.split(' | ').includes(cur.heatNr)) {
                    acc.heatNr = !acc.heatNr ? cur.heatNr : `${acc.heatNr} | ${cur.heatNr}`
                }
                if (!acc.cif.split(' | ').includes(cur.certificate.cif)) {
                    acc.cif = !acc.cif ? cur.certificate.cif : `${acc.cif} | ${cur.certificate.cif}`
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
            docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
                    case 'storedproc':
                        if (['spColliQty', 'spColliWeight'].includes(docfield.fields.name) && !!docfield.param && spColli.hasOwnProperty(docfield.param.toUpperCase())) {
                            arrayLine.push({
                                val: spColli[docfield.param.toUpperCase()][docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else if (docfield.fields.name === 'spAutoNr') {
                            arrayLine.push({
                                val: itemIndex + 1,
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else if (docfield.fields.name === 'spLineWeight') {
                            arrayLine.push({
                                val: calcWeight(tempUom, packitem.pcs, packitem.mtrs, article.netWeight),
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else if (docfield.fields.name === 'spPlQty') {
                            arrayLine.push({
                                val: tempUom === 'pcs' ? packitem.pcs : packitem.mtrs,
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else {
                            arrayLine.push({
                                val: '',
                                row: docfield.row,
                                col: docfield.col,
                                type: 'String'
                            });
                        }
                        break;
                    case 'collipack':
                        arrayLine.push({
                            val: collipack[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'packitem':
                        arrayLine.push({
                            val: packitem[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'certificate':
                        arrayRow.push({
                            val: certificate[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'sub':
                        if (docfield.fields.name === 'heatNr') {
                            arrayRow.push({
                                val: certificate[docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else {
                            arrayRow.push({
                                val: packitem.sub[docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        }
                        break;
                    case 'po':
                        if (['project', 'projectNr'].includes(docfield.fields.name)) {
                            arrayLine.push({
                                val: docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else {
                            arrayLine.push({
                                val: packitem.sub.po[docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        }
                        break;
                    case 'article':
                        arrayLine.push({
                            val: article[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    default: arrayLine.push({
                        val: '',
                        row: docfield.row,
                        col: docfield.col,
                        type: 'String'
                    });
                }
            });
            resolve(arrayLine);
            // resolve(lineToRows(arrayLine));
        });
    });
}

// function lineToRows(arrayLine) {
//     let tempRows = [];
//     let lineObject = arrayLine.reduce(function (acc, cur) {
//         if (!!cur.row && cur.row > acc.maxRow) {
//             acc.maxRow = cur.row;
//         }

//         if (!!cur.row && !acc.hasOwnProperty(cur.row)) {
//             acc[cur.row] = [cur];
//         } else if (!!cur.row && acc.hasOwnProperty(cur.row)) {
//             acc[cur.row].push(cur);
//         }

//         return acc;

//     }, { maxRow: 1 });

//     for (var i = 1; i < lineObject.maxRow + 1; i++) {
//         if (lineObject.hasOwnProperty(i)) {
//             tempRows.push(lineObject[i]);
//         } else {
//             tempRows.push([]);
//         }
//     }

//     // console.log(lineObject)

//     return arrayLine;
// }

function getArticle(erp, vlArtNo, vlArtNoX) {
    return new Promise(function (resolve) {
        if (!vlArtNo && !vlArtNoX) {
            resolve({
                hsCode: '',
                netWeight: '', 
            });
        } else {
            let conditions = vlArtNo ? { erp: erp, vlArtNo : vlArtNo } : { erp: erp, vlArtNoX : vlArtNoX };
            Article.findOne(conditions, function (err, article) {
                // let tempUom = 'pcs';
                // if (!!uom && ['M', 'MT', 'MTR', 'MTRS', 'LM'].includes(uom.toUpperCase())) {
                //     tempUom = 'mtrs';
                // } else if (!!uom && ['F', 'FT', 'FEET', 'FEETS'].includes(uom.toUpperCase())) {
                //     tempUom = 'feets';
                // } else if (!!uom && uom.toUpperCase() === 'MT') {
                //     tempUom = 'mt';
                // }

                if(err || _.isNull(article)) {
                    resolve({
                        hsCode: '',
                        netWeight: '', 
                    });
                } else {
                    resolve({
                        hsCode: article.hsCode,
                        netWeight: article.netWeight
                        // calcWeight(tempUom, pcs, mtrs, article.netWeight)
                    });
                }
            });
        }
    });
}

function calcWeight(tempUom, pcs, mtrs, weight) {
    switch(tempUom) {
        case 'pcs': return pcs * weight || 0;
        case 'mtrs': return mtrs * weight || 0;
        case 'feets': return mtrs * 0.3048 * weight || 0;
        case 'mt': return mtrs / 1000 || 0;
        default: return 0;
    }
}















