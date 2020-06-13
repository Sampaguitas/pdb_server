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

router.post('/', function (req, res) {
    const docDefId = req.query.id;
    const locale = req.query.locale;
    const pickticketId = req.body.pickticketId;

    if (!pickticketId) {
        res.status(400).json({message: 'No PickTicket selected'});
    } else if (!docDefId) {
        res.status(400).json({message: 'No file selected'});
    } else {
        DocDef.findById(docDefId).populate([
            {
                path: 'docfields',
                populate: {
                    path: 'fields'
                }
            },
            {
                path: 'project',
                populate: {
                    path: 'picktickets',
                    match: { pickticketId: pickticketId },
                    populate: [
                        {
                            path: 'pickitems',
                            populate: [
                                {
                                    path: 'miritem',
                                    populate: {
                                        path: 'po',
                                    }
                                },
                                {
                                    path: 'location',
                                    populate: [
                                        {
                                            path: 'area'
                                        },
                                        {
                                            path: 'heatlocs'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            path: 'mir',
                        },
                        {
                            path: 'warehouse',
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
                .then(async function(workbook) {

                    const docFieldSol = filterDocFiled(docDef.docfields, 'Sheet1', 'Line');
                    const docFieldSoh = filterDocFiled(docDef.docfields, 'Sheet1', 'Header');
                    const firstColSol = getColumnFirst(docFieldSol);
                    const lastColSol = getColumnLast(docFieldSol, docDef.col1);
                    const soh = await getHeaders(docDef, docFieldSoh, locale);
                    const sol = await getLines(docDef, docFieldSol, locale);
    
                    const docFieldStl = filterDocFiled(docDef.docfields, 'Sheet2', 'Line');
                    const docFieldSth = filterDocFiled(docDef.docfields, 'Sheet2', 'Header');
                    const firstColStl = getColumnFirst(docFieldStl);
                    const lastColStl = getColumnLast(docFieldStl, docDef.col2);
                    const sth = await getHeaders(docDef, docFieldSth, locale);
                    const stl = await getLines(docDef, docFieldStl, locale);
    
                    
                    
                    workbook.eachSheet(function(worksheet, sheetId) {
                    if (sheetId === 1 && sol && firstColSol && lastColSol) {
                        //fill all headers first
                        soh.map(function (head) {
                            head.map(function (cell) {
                                if (!!cell.col && !!cell.row && cell.val != '') {
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
                                if (!!cell.col && cell.val !== '') {
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
                                if (!!cell.col && !!cell.row && cell.val !== '') {
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
                                if (!!cell.col && cell.val != '') {
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
    }
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

function getHeaders(docDef, docfields, locale) {
    return new Promise(async function (resolve) {
        arrayLines = [];
        let pickticket = docDef.project.picktickets[0];
        if(!_.isUndefined(pickticket) && !_.isEmpty(pickticket.pickitems)) {
            let itemCount = !_.isEmpty(pickticket.pickitems) ? pickticket.pickitems.length : '';
            let mirWeight = 0;
            if (!_.isEmpty(pickticket.pickitems)) {
                mirWeight = pickticket.pickitems.reduce(function (acc, cur) {
                    if (!!cur.miritem.totWeight) {
                        acc += cur.miritem.totWeight;
                    }
                    return acc;
                }, 0);
            }
            pickticket.pickitems.map(pickitem => {
                let arrayRow = [];
                docfields.map(docfield => {
                    switch(docfield.fields.fromTbl) {
                        case 'pickticket':
                            if (_.isEqual(docfield.fields.name, 'pickStatus')) {
                                arrayRow.push({
                                    val: pickticket.isProcessed ? 'Closed' : 'Open',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            } else {
                                arrayRow.push({
                                    val: pickticket.isProcessed ? 'Closed' : 'Open',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            }
                            break;
                        case 'mir':
                            if (['itemCount', 'mirWeight'].includes(docfield.fields.name)) {
                                arrayRow.push({
                                    val: _.isEqual(docfield.fields.name, 'itemCount') ? itemCount : mirWeight,
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            } else {
                                arrayRow.push({
                                    val: pickticket.mir[docfield.fields.name],
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            }
                            break;
                        case 'miritem':
                                arrayRow.push({
                                    val: pickitem.miritem[docfield.fields.name],
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
                                    val: pickitem.miritem.po[docfield.fields.name] || '',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            }
                            break;
                        case 'location': 
                            if (docfield.fields.name === 'warehouse') {
                                arrayRow.push({
                                    val: pickticket.warehouse.warehouse || '',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            } else if (docfield.fields.name === 'area'){
                                arrayRow.push({
                                    val: pickitem.location.area.area,
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type 
                                });
                            } else if (docfield.fields.name === 'location') {
                                let locName = getLocName(pickitem.location, pickitem.location.area);
                                arrayRow.push({
                                    val: locName,
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
                        default: arrayRow.push({
                            val: '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type 
                        });
                    }
                });
                arrayLines.push(arrayRow);
            });
        }
        return resolve(arrayLines);
    });
}

function getLines(docDef, docfields, locale) {
    return new Promise(async function (resolve) {

        let myRowPromises = [];
        let pickticket = docDef.project.picktickets[0];
        if(!_.isUndefined(pickticket) && !_.isEmpty(pickticket.pickitems)) {
            let itemCount = !_.isEmpty(pickticket.pickitems) ? pickticket.pickitems.length : '';
            let mirWeight = 0;
            if (!_.isEmpty(pickticket.pickitems)) {
                mirWeight = pickticket.pickitems.reduce(function (acc, cur) {
                    if (!!cur.miritem.totWeight) {
                        acc += cur.miritem.totWeight;
                    }
                    return acc;
                }, 0);
            }
            pickticket.pickitems.map(pickitem => {
                if (_.isEmpty(pickitem.location.heatlocs)) {
                    pickitem.location.heatlocs.map(heatloc, heatIndex => {
                        myRowPromises.push(getRow(docDef, docfields, pickticket, itemCount, mirWeight, pickitem, heatloc, heatIndex));
                    });
                } else {
                    myRowPromises.push(getRow(docDef, docfields, pickticket, itemCount, mirWeight, pickitem, '', 0));
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

function emptyRow(docfields) {
    return new Promise(function (resolve) {
        let arrayRow = [];
        docfields.map(docfield => {
            arrayRow.push({
                val: '',
                row: docfield.row,
                col: docfield.col,
                type: docfield.fields.type 
            });
        });
        resolve(arrayRow);
    });
}

function getRow(docDef, docfields, pickticket, itemCount, mirWeight, pickitem, heatloc, heatIndex) {
    return new Promise(function(resolve) {
        let arrayRow = [];
        docfields.map(docfield => {
            switch(docfield.fields.fromTbl) {
                case 'pickticket':
                    if (_.isEqual(docfield.fields.name, 'pickStatus')) {
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickticket.isProcessed ? 'Closed' : 'Open',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    } else {
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickticket.isProcessed ? 'Closed' : 'Open',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    }
                    break;
                case 'mir':
                    if (['itemCount', 'mirWeight'].includes(docfield.fields.name)) {
                        arrayRow.push({
                            val: !!heatIndex ? '' : _.isEqual(docfield.fields.name, 'itemCount') ? itemCount : mirWeight,
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    } else {
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickticket.mir[docfield.fields.name],
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    }
                    break;
                case 'miritem':
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickitem.miritem[docfield.fields.name],
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    break;
                case 'po':
                    if (['project', 'projectNr'].includes(docfield.fields.name)) {
                        arrayRow.push({
                            val: !!heatIndex ? '' : docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    } else {
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickitem.miritem.po[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    }
                    break;
                case 'location': 
                    if (docfield.fields.name === 'warehouse') {
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickticket.warehouse.warehouse || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    } else if (docfield.fields.name === 'area'){
                        arrayRow.push({
                            val: !!heatIndex ? '' : pickitem.location.area.area,
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type 
                        });
                    } else if (docfield.fields.name === 'location') {
                        let locName = getLocName(pickitem.location, pickitem.location.area);
                        arrayRow.push({
                            val: !!heatIndex ? '' : locName,
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
                    if(!!heatloc) {
                        arrayRow.push({
                            val: _.isEqual(docfield.fields.name, 'cif') ? heatloc.cif : heatNr,
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
                default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
                    type: docfield.fields.type 
                });
            }
        });
        resolve(arrayRow);
    });
}

function getLocName(location, area) {
    return `${area.areaNr}/${location.hall}${location.row}-${leadingChar(location.col, '0', 3)}${!!location.height ? '-' + location.height : ''}`;
}

function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
}

function copyObject(mainObj) {
    let objCopy = {};
    let key;

    for (key in mainObj) {
        objCopy[key] = mainObj[key];
    }
    return objCopy;
}















