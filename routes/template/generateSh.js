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
    const selectedIds = req.body.selectedIds;

    let poIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
    });

    if (_.isEmpty(poIds)) {
        res.status(400).json({message: 'No lines selected'});
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
                    path: 'transactions',
                    match: { poId: selectedIds.length > 0 ? { $in: poIds } : { $exists: true } },
                    options: {
                        sort: {
                            createdAt: 'asc'
                        }
                    },
                    // options: {
                    //     sort: {
                    //         // poId: 'asc',
                    //         transDate: 'asc'
                    //     }
                    // },
                    populate: [
                        {
                            path: 'po',
                        },
                        {
                            path: 'location',
                            populate: {
                                path: 'area',
                                populate: {
                                    path: 'warehouse'
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

function getHeaders(docDef, docfields, locale) {
    return new Promise(async function (resolve) {
        arrayLines = [];
        if(!_.isEmpty(docDef.project.transactions)) {
            docDef.project.transactions.map(transaction => {
                let arrayRow = [];
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
                                    val: transaction.po[docfield.fields.name] || '',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            }
                            break;
                        case 'location': 
                            if (docfield.fields.name === 'warehouse') {
                                arrayRow.push({
                                    val: transaction.location.area.warehouse.warehouse || '',
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type
                                });
                            } else if (docfield.fields.name === 'area'){
                                arrayRow.push({
                                    val: transaction.location.area.area,
                                    row: docfield.row,
                                    col: docfield.col,
                                    type: docfield.fields.type 
                                });
                            } else if (docfield.fields.name === 'location') {
                                let locName = getLocName(transaction.location, transaction.location.area);
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
                        case 'transaction':
                            arrayRow.push({
                                val: transaction[docfield.fields.name],
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type 
                            });
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
        let transactions = docDef.project.transactions;

        if(!_.isEmpty(transactions)) {
            let pos = transactions.reduce(function (acc, cur) {
                if (!_.isEmpty(cur.location) && !_.isEmpty(cur.location.area) && !_.isEmpty(cur.location.area.warehouse)) {
                    let foundPo = acc.find(element => _.isEqual(element._id, cur.poId));
                    if (!_.isUndefined(foundPo)) {
                        foundPo.spPoQty += cur.transQty;
                        let foundWh = foundPo.warehouses.find(element => _.isEqual(element._id, cur.location.area.warehouseId));
                        if (!_.isUndefined(foundWh)) {
                            foundWh.spWhQty += cur.transQty;
                            let foundLoc = foundWh.locations.find(element => _.isEqual(element._id, cur.locationId));
                            let transCopy = copyObject(cur); //{ transQty: cur.transQty, transDate: cur.transDate, transType: cur.transType, transComment: cur.transComment});
                            if (!_.isUndefined(foundLoc)) {
                                foundLoc.spLocQty += cur.transQty;
                                foundLoc.transactions.push(transCopy);
                            } else {
                                let locCopy = copyObject(cur.location);
                                //add fields: name, areaNr and area to locCopy and spLocQty to locCopy
                                locCopy.location = getLocName(cur.location, cur.location.area);
                                locCopy.area = cur.location.area.area;
                                locCopy.spLocQty = cur.transQty;
                                //each locations has transactions
                                locCopy.transactions = [transCopy];
                                // locCopy.transactions.push(transCopy);
                                foundWh.locations.push(locCopy);
                            }
                        } else {
                            let whCopy = copyObject(cur.location.area.warehouse);
                            let locCopy = copyObject(cur.location);
                            let transCopy = copyObject(cur); //{ transQty: cur.transQty, transDate: cur.transDate, transType: cur.transType, transComment: cur.transComment});
                            //add field: spWhQty to whCopy initial value is whCopy
                            whCopy.spWhQty = cur.transQty;
                            //add fields: name, areaNr and area to locCopy and spLocQty to locCopy
                            locCopy.location = getLocName(cur.location, cur.location.area);
                            locCopy.area = cur.location.area.area;
                            locCopy.spLocQty = cur.transQty;
                            //each locations has transactions
                            locCopy.transactions = [transCopy];
                            // locCopy.transactions.push(transCopy);
                            //each warehouse has locations
                            whCopy.locations = [locCopy];
                            // whCopy.locations.push(locCopy);
                            //each po has warehouses
                            foundPo.warehouses.push(whCopy);
                        }
                    } else {
                        //objects
                        let poCopy = copyObject(cur.po);
                        let whCopy = copyObject(cur.location.area.warehouse);
                        let locCopy = copyObject(cur.location);
                        let transCopy = copyObject(cur); //{ transQty: cur.transQty, transDate: cur.transDate, transType: cur.transType, transComment: cur.transComment});
                        //add field: spPoQty to poCopy initial value is transQty
                        poCopy.spPoQty = cur.transQty;
                        //add field: spWhQty to whCopy initial value is whCopy
                        whCopy.spWhQty = cur.transQty;
                        //add fields: name, areaNr and area to locCopy and spLocQty to locCopy
                        locCopy.location = getLocName(cur.location, cur.location.area);
                        locCopy.area = cur.location.area.area;
                        locCopy.spLocQty = cur.transQty;
                        //each locations has transactions
                        locCopy.transactions = [transCopy];
                        // locCopy.transactions.push(transCopy);
                        //each warehouse has locations
                        whCopy.locations = [locCopy];
                        // whCopy.locations.push(locCopy);
                        //each po has warehouses
                        poCopy.warehouses = [whCopy];
                        // poCopy.warehouses.push(whCopy);
                        //push poCopy to pos
                        acc.push(poCopy)
                    }
                }
                return acc;
            }, []);

            pos.forEach( (po, poIndex, poArray) => {
                po.warehouses.forEach(warehouse => {
                    warehouse.locations.forEach(location => {
                        location.transactions.forEach(transaction => {
                            myRowPromises.push(getRow(docDef, docfields, po, warehouse, location, transaction));
                        });
                        myRowPromises.push(totalLocRow(docfields, location));
                    });
                    myRowPromises.push(totalWhRow(docfields, warehouse));
                });
                myRowPromises.push(totalPoRow(docfields, po));
                if (poIndex < poArray.length && poArray.length > 1) {
                    myRowPromises.push(emptyRow(docfields));
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

function totalPoRow(docfields, po) {
    return new Promise(function (resolve) {
        let arrayRow = [];
        docfields.map(docfield => {
            switch(docfield.fields.fromTbl) {
                case 'po': 
                    arrayRow.push({
                        val: po[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                    });
                    break;
                case 'storedproc':
                    if (docfield.fields.name === 'spPoQty') {
                        arrayRow.push({
                            val: po.spPoQty || 0,
                            row: docfield.row,
                            col: docfield.col,
                            type: 'Number'
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
        resolve(arrayRow);
    });
}

function totalWhRow(docfields, warehouse) {
    return new Promise(function (resolve) {
        let arrayRow = [];
        docfields.map(docfield => {
            switch(docfield.fields.fromTbl) {
                case 'location': 
                    if (docfield.fields.name === 'warehouse') {
                        arrayRow.push({
                            val: warehouse.warehouse || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: 'String'
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
                case 'storedproc':
                    if (docfield.fields.name === 'spWhQty') {
                        arrayRow.push({
                            val: warehouse.spWhQty || 0,
                            row: docfield.row,
                            col: docfield.col,
                            type: 'Number'
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
        resolve(arrayRow);
    });
}

function totalLocRow(docfields, location) {
    return new Promise(function (resolve) {
        let arrayRow = [];
        docfields.map(docfield => {
            switch(docfield.fields.fromTbl) {
                case 'location': 
                    if (['location', 'area'].includes(docfield.fields.name)) {
                        arrayRow.push({
                            val: location[docfield.fields.name] || '',
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
                case 'storedproc':
                    if (docfield.fields.name === 'spLocQty') {
                        arrayRow.push({
                            val: location.spLocQty || 0,
                            row: docfield.row,
                            col: docfield.col,
                            type: 'Number'
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
        resolve(arrayRow);
    });
}

function getRow(docDef, docfields, po, warehouse, location, transaction) {
    return new Promise(function(resolve) {
        let arrayRow = [];
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
                case 'location':
                    if (docfield.fields.name === 'warehouse') {
                        arrayRow.push({
                            val: warehouse.warehouse || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: 'String'
                        });
                    } else if (['area', 'location'].includes(docfield.fields.name)) {
                        arrayRow.push({
                            val: location[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                    } else {
                        arrayRow.push({
                            val: '',
                            row: docfield.row,
                            col: docfield.col,
                            type: 'String'
                        });
                    }
                    break;
                case 'transaction':
                    arrayRow.push({
                        val: transaction[docfield.fields.name] || '',
                        row: docfield.row,
                        col: docfield.col,
                        type: docfield.fields.type
                    });
                    break;
                default: arrayRow.push({
                    val: '',
                    row: docfield.row,
                    col: docfield.col,
                    type: 'String'
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















