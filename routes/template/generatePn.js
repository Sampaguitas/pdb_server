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

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.get('/', function (req, res) {
  const docDefId = req.query.docDefId;
  const locale = req.query.locale;
  const selectedPl = req.query.selectedPl;
    
    DocDef.aggregate([
        {
            "$match": { "_id": new ObjectId(docDefId) }
        },
        {
            "$lookup": {
                "from": "docfields",
                "let": { "docdef_id": "$_id" },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    { "$eq": [ "$docdefId",  "$$docdef_id" ] },
                                ]
                            }
                        }
                    },
                    {
                        "$lookup": {
                            "from": "fields",
                            "localField": "fieldId",
                            "foreignField": "_id",
                            "as": "fields"
                        }
                    },
                    {
                        "$addFields": {
                            "fields": { "$arrayElemAt": [ "$fields", 0] }
                        }
                    },
                ],
                "as": "docfields"
            }
        },
        {
            "$lookup": {
                "from": "projects",
                "let": { "docdef_projectId": "$projectId" },
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    { "$eq": [ "$_id",  "$$docdef_projectId" ] },
                                ]
                            }
                        }
                    },
                    {
                        "$lookup": {
                            "from": "erps",
                            "localField": "erpId",
                            "foreignField": "_id",
                            "as": "erp"
                        }
                    },
                    {
                        "$addFields": {
                            "erp": { "$arrayElemAt": [ "$erp", 0] }
                        }
                    },
                    {
                        "$lookup": {
                            "from": "collipacks",
                            "let": { "project_id": "$_id" },
                            "pipeline": [
                                {
                                    "$match": {
                                        "$expr": {
                                            "$and": [
                                                { "$eq": [ "$projectId", "$$project_id"] },
                                                { "$eq": [ "$plNr",  selectedPl ] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        "from": "packitems",
                                        "let": {
                                            "collipack_plNr": "$plNr",
                                            "collipack_colliNr": "$colliNr",
                                            "collipack_projectId": "$projectId"
                                        },
                                        "pipeline": [
                                            {
                                                "$match": {
                                                    "$expr": {
                                                        "$and": [
                                                            { "$eq": [ { "$toDouble": "$plNr" }, { "$toDouble": "$$collipack_plNr" }] },
                                                            { "$eq": [ "$colliNr", "$$collipack_colliNr"] },
                                                            { "$eq": [ "$projectId", "$$collipack_projectId"] },
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                "$lookup": {
                                                    "from": "subs",
                                                    "let": { "packitem_subId": "$subId" },
                                                    "pipeline": [
                                                        {
                                                            "$match": {
                                                                "$expr": {
                                                                    "$and": [
                                                                        { "$eq": ["$_id", "$$packitem_subId" ] }
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        {
                                                            "$lookup": {
                                                                "from": "pos",
                                                                "localField": "poId",
                                                                "foreignField": "_id",
                                                                "as": "po"
                                                            }
                                                        },
                                                        {
                                                            "$lookup": {
                                                                "from": "heats",
                                                                "let": { "sub_id": "$_id" },
                                                                "pipeline": [
                                                                    {
                                                                        "$match": {
                                                                            "$expr": {
                                                                                "$and": [
                                                                                    { "$eq": ["$subId", "$$sub_id" ] }
                                                                                ]
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        "$lookup": {
                                                                            "from": "certificates",
                                                                            "localField": "certificateId",
                                                                            "foreignField": "_id",
                                                                            "as": "certificate"
                                                                        }
                                                                    },
                                                                    {
                                                                        "$addFields": {
                                                                            "certificate": { "$arrayElemAt": [ "$certificate", 0] }
                                                                        }
                                                                    },
                                                                    {
                                                                        "$sort": {
                                                                            "heatNr": 1
                                                                        }
                                                                    }
                                                                ],
                                                                "as": "heats"
                                                            }
                                                        },
                                                        {
                                                            "$addFields": {
                                                                "po": { "$arrayElemAt": [ "$po", 0] }
                                                            }
                                                        }
                                                    ],
                                                    "as": "sub"
                                                }
                                            },
                                            {
                                                "$addFields": {
                                                    "sub": { "$arrayElemAt": [ "$sub", 0] }
                                                }
                                            }
                                        ],
                                        "as": "packitems"
                                    }
                                },
                                {
                                    "$sort": {
                                        "plNr": 1,
                                        "colliNr": 1,
                                    }
                                }
                            ],
                            "as": "collipacks"
                        }
                    }
                ],
                "as": "project"
            }
        },
        {
            "$addFields": {
                "project": { "$arrayElemAt": [ "$project", 0] }
            }
        },
    ])
    .exec(function (err, docDef){
        if (err) {
        return res.status(400).json({message: 'An error has occured'});
        } else if (!!docDef.length < 1 || !docDef[0].project) {
        return res.status(400).json({message: 'Could not retrive project information.'});
        } else {
            var s3 = new aws.S3();
            var params = {
                Bucket: awsBucketName,
                Key: path.join('templates', String(docDef[0].project.number), docDef[0].field),
            };
            var wb = new Excel.Workbook();
            wb.xlsx.read(s3.getObject(params).createReadStream())
            .then(async function(workbook) {

                const docFieldSol = filterDocFiled(docDef[0].docfields, 'Sheet1', 'Line');
                const docFieldSoh = filterDocFiled(docDef[0].docfields, 'Sheet1', 'Header');
                const firstColSol = getColumnFirst(docFieldSol);
                const lastColSol = getColumnLast(docFieldSol, docDef[0].col1);
                const soh = await getLines(docDef[0], docFieldSoh, locale);
                const sol = await getLines(docDef[0], docFieldSol, locale);

                const docFieldStl = filterDocFiled(docDef[0].docfields, 'Sheet2', 'Line');
                const docFieldSth = filterDocFiled(docDef[0].docfields, 'Sheet2', 'Header');
                const firstColStl = getColumnFirst(docFieldStl);
                const lastColStl = getColumnLast(docFieldStl, docDef[0].col2);
                const sth = await getLines(docDef[0], docFieldSth, locale);
                const stl = await getLines(docDef[0], docFieldStl, locale);

                
                
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
                        worksheet.duplicateRow(docDef[0].row1, sol.length -1, true);
                    }
                    //fill all Lines from our grid in the inserted rows
                    sol.map(function (line, lineIndex) {
                        line.map(function (cell) {
                            if (cell.col && cell.val) {
                                worksheet.getCell(alphabet(cell.col) + (docDef[0].row1 + lineIndex)).value = cell.val; 
                            }
                        });
                    });
                    //set up page for printing
                    wsPageSetup(docDef[0].row1, worksheet, lastColSol);

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
                        worksheet.duplicateRow(docDef[0].row2, stl.length -1, true);
                    }
                    //fill all Lines from our grid in the inserted rows
                    stl.map(function (line, lineIndex) {
                        line.map(function (cell) {
                            if (cell.col && cell.val) {
                                worksheet.getCell(alphabet(cell.col) + (docDef[0].row2 + lineIndex)).value = cell.val;
                            }
                        });
                    });
                    //set up page for printing
                    wsPageSetup(docDef[0].row2, worksheet, lastColStl);
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

        // let arrayLines = [];
        // let arrayRow = [];
        let myRowPromises = [];
        let arrayColli = [];

        if(docDef.project.collipacks) {
            docDef.project.collipacks.map(collipack => {
                if(collipack.packitems){
                    collipack.packitems.map(packitem => {
                        myRowPromises.push(getRow(docDef, docfields, collipack, packitem));
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

function getRow(docDef, docfields, collipack, packitem) {
    return new Promise(function(resolve) {
        let arrayRow = [];
        getArticle(docDef.project.erp.name, packitem.pcs, packitem.mtrs, packitem.sub.po.uom, packitem.sub.po.vlArtNo, packitem.sub.po.vlArtNoX).then(article => {
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
                    case 'collipack':
                        arrayRow.push({
                            val: collipack[docfield.fields.name] || '',
                            row: docfield.row,
                            col: docfield.col,
                            type: docfield.fields.type
                        });
                        break;
                    case 'packitem':
                        arrayRow.push({
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
                            arrayRow.push({
                                val: docfield.fields.name === 'project' ? docDef.project.name || '' : docDef.project.number || '',
                                row: docfield.row,
                                col: docfield.col,
                                type: docfield.fields.type
                            });
                        } else {
                            arrayRow.push({
                                val: packitem.sub.po[docfield.fields.name] || '',
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


// DocDef
// .findById(docDefId)
// .populate([
//     {
//         path: 'docfields',
//         populate: {
//             path: 'fields'
//         }
//     },
//     {
//         path: 'project',
//         populate: [
//             {
//                 path: 'erp',
//             },
//             {
//                 path: 'collipacks',
//                 match: { plNr: selectedPl },
//                 options: {
//                     sort: {
//                         plNr: 'asc',
//                         colliNr: 'asc',
//                     }
//                 },
//                 populate: {
//                     path: 'packitems',
//                     populate: {
//                         path: 'sub',
//                         populate: [
//                             {
//                                 path: 'po',
//                             },
//                             {
//                                 path: 'heats',
//                                 options: {
//                                     sort: {
//                                         heatNr: 'asc'
//                                     }
//                                 },
//                                 populate: {
//                                     path: 'certificate',
//                                 }
//                             }
//                         ]
//                     }
//                 }
//             }
//         ]
//     }
// ])












