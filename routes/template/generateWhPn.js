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
            .then(async function(workbook) {

                const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
                const docFieldSoh = filterDocFiled(docDef.docfields, 'Sheet1', 'Header');
                const firstColSol = getColumnFirst(docFieldSol);
                const lastColSol = getColumnLast(docFieldSol, docDef.col1);
                const soh = await getLines(docDef, docFieldSoh, locale);
                const sol = await getLines(docDef, docFieldSol, locale);

                const docFieldStl = filterDocFiled(docDef.docfields, 'Sheet2', 'Line');
                const docFieldSth = filterDocFiled(docDef.docfields, 'Sheet2', 'Header');
                const firstColStl = getColumnFirst(docFieldStl);
                const lastColStl = getColumnLast(docFieldStl, docDef.col2);
                const sth = await getLines(docDef, docFieldSth, locale);
                const stl = await getLines(docDef, docFieldStl, locale);

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

function getLines(docDef, docfields, locale) {
    return new Promise(async function (resolve) {

        let myRowPromises = [];

        if(docDef.project.whcollipacks) {
            docDef.project.whcollipacks.map(whcollipack => {
                if(whcollipack.whpackitems){
                    whcollipack.whpackitems.map(whpackitem => {
                        myRowPromises.push(getRow(docDef, docfields, whcollipack, whpackitem));
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

function getRow(docDef, docfields, whcollipack, whpackitem) {
    return new Promise(function(resolve) {
        let arrayRow = [];
        getArticle(docDef.project.erp.name, whpackitem.pcs, whpackitem.mtrs, whpackitem.pickitem.miritem.po.uom, whpackitem.pickitem.miritem.po.vlArtNo, whpackitem.pickitem.miritem.po.vlArtNoX).then(article => {
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
            docfields.map(docfield => {
                switch(docfield.fields.fromTbl) {
                    case 'collipack':
                        arrayRow.push({
                            val: whcollipack[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'packitem':
                        arrayRow.push({
                            val: whpackitem[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'pickitem':
                        arrayRow.push({
                            val: whpackitem.pickitem[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'miritem':
                        arrayRow.push({
                            val: whpackitem.pickitem.miritem[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
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
                                val: whpackitem.pickitem.miritem.po[docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        }
                        break;
                    case 'mir':
                        if (['itemCount', 'mirWeight'].includes(docfield.fields.name)) {
                            arrayRow.push({
                                val: '',
                                row: docfield.row,
                                col: docfield.col,
                                type: 'String'
                            });
                        } else {
                            arrayRow.push({
                                val: whpackitem.pickitem.miritem.mir[docfield.fields.name] || '',
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
                    case 'pickticket':
                        if (_.isEqual(docfield.fields.name, 'pickStatus')) {
                            arrayRow.push({
                                val: whpackitem.pickitem.pickticket.isProcessed ? 'Closed' : 'Open',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        }else {
                            arrayRow.push({
                                val: whpackitem.pickitem.pickticket[docfield.fields.name] || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        }
                        break;
                    case 'article':
                        arrayRow.push({
                            val: article[docfield.fields.name] || '',
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
            resolve(arrayRow);
        });
    });
}

function getArticle(erp, pcs, mtrs, uom, vlArtNo, vlArtNoX) {
    return new Promise(function (resolve) {
        if (!vlArtNo && !vlArtNoX) {
            resolve({
                hsCode: '',
                netWeight: '', 
            });
        } else {
            let conditions = vlArtNo ? { erp: erp, vlArtNo : vlArtNo } : { erp: erp, vlArtNoX : vlArtNoX };
            Article.findOne(conditions, function (err, article) {
                let tempUom = 'pcs';
                if (!!uom && ['M', 'MT', 'MTR', 'MTRS', 'LM'].includes(uom.toUpperCase())) {
                    tempUom = 'mtrs';
                } else if (!!uom && ['F', 'FT', 'FEET', 'FEETS'].includes(uom.toUpperCase())) {
                    tempUom = 'feets';
                } else if (!!uom && uom.toUpperCase() === 'MT') {
                    tempUom = 'mt';
                }

                if(err || _.isNull(article)) {
                    resolve({
                        hsCode: '',
                        netWeight: '', 
                    });
                } else {
                    resolve({
                        hsCode: article.hsCode,
                        netWeight: calcWeight(tempUom, pcs, mtrs, article.netWeight)
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















