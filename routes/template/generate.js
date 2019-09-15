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
              DocField.find({docdefId: docDef}, function(errDocField, resDocField){
                if (errDocField){
                  return res.status(400).json({message: 'an error occured'});
                } else {
                  workbook.properties.date1904 = true;
                  const ws = workbook.getWorksheet(1);
                  // ws.style = Object.create(ws.style);
                  console.log('alphabet:', alphabet(28));
                  ws.addTable({
                    name: 'MyTable',
                    ref: 'A7',
                    headerRow: false,
                    totalsRow: false,
                    columns: [
                      {
                        name: 'Client PO',
                        filterButton: true,
                        style: ws.getCell('A8').style
                      },
                      {
                        name: 'Rev',
                        filterButton: true,
                        style: ws.getCell('B8').style
                      },
                      {
                        name: 'Item',
                        filterButton: true,
                        style: ws.getCell('C8').style
                      },
                      {
                        name: 'Material code',
                        filterButton: true,
                        style: ws.getCell('D8').style
                      },
                      {
                        name: 'PO Quantity',
                        filterButton: true,
                        style: ws.getCell('E8').style
                      },
                      {
                        name: 'Qty Unit',
                        filterButton: true,
                        style: ws.getCell('F8').style
                      },
                      {
                        name: 'Size',
                        filterButton: true,
                        style: ws.getCell('G8').style
                      },
                      {
                        name: 'Sch/WT',
                        filterButton: true,
                        style: ws.getCell('H8').style
                      },
                      {
                        name: 'Description',
                        filterButton: true,
                        style: ws.getCell('I8').style
                      },
                      {
                        name: 'Material',
                        filterButton: true,
                        style: ws.getCell('J8').style
                      },
                      {
                        name: 'Remarks',
                        filterButton: true,
                        style: ws.getCell('K8').style
                      },
                      {
                        name: 'Contr Del Date',
                        filterButton: true,
                        style: ws.getCell('L8').style
                      },
                      {
                        name: 'Contr Del Condition',
                        filterButton: true,
                        style: ws.getCell('M8').style
                      },
                      {
                        name: 'VL SO',
                        filterButton: true,
                        style: ws.getCell('N8').style
                      },
                      {
                        name: 'VL SO Item',
                        filterButton: true,
                        style: ws.getCell('O8').style
                      },
                      {
                        name: 'Supplier',
                        filterButton: true,
                        style: ws.getCell('P8').style
                      },
                      {
                        name: 'Exp Ready/Del date',
                        filterButton: true,
                        style: ws.getCell('Q8').style
                      },
                      {
                        name: '(Split) PO Qty',
                        filterButton: true,
                        style: ws.getCell('R8').style
                      },
                      {
                        name: 'NFI No',
                        filterButton: true,
                        style: ws.getCell('S8').style
                      },
                      {
                        name: 'RFI Qty',
                        filterButton: true,
                        style: ws.getCell('T8').style
                      },
                      {
                        name: 'Act RFI Date',
                        filterButton: true,
                        style: ws.getCell('U8').style
                      },
                      {
                        name: 'Released Qty',
                        filterButton: true,
                        style: ws.getCell('V8').style
                      },
                      {
                        name: 'Insp Rel Date',
                        filterButton: true,
                        style: ws.getCell('W8').style
                      },
                      {
                        name: 'PL No',
                        filterButton: true,
                        style: ws.getCell('X8').style
                      },
                      {
                        name: 'PL Date',
                        filterButton: true,
                        style: ws.getCell('Y8').style
                      },
                    ],
                    rows: [
                      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '' ],
                      ['PO-1234', 'Rev 1', 1, 'mtlCode', 1000, 'MTR', '12"', 'S40', 'Pipe SMLS', 'A106 B', '', new Date('2019-09-15'), new Date('2019-09-15'), 'SO-123', 1, 'Vallourec', new Date('2019-09-15'), 250, 1, 250,  new Date('2019-09-15'), 250, new Date('2019-09-15'), 2, new Date('2019-09-15') ], 
                      ['PO-1234', 'Rev 1', 1, 'mtlCode', 1000, 'MTR', '12"', 'S40', 'Pipe SMLS', 'A106 B', '', new Date('2019-09-15'), new Date('2019-09-15'), 'SO-123', 1, 'Vallourec', new Date('2019-09-15'), 250, 1, 250,  new Date('2019-09-15'), 250, new Date('2019-09-15'), 2, new Date('2019-09-15') ],
                      ['PO-1234', 'Rev 1', 1, 'mtlCode', 1000, 'MTR', '12"', 'S40', 'Pipe SMLS', 'A106 B', '', new Date('2019-09-15'), new Date('2019-09-15'), 'SO-123', 1, 'Vallourec', new Date('2019-09-15'), 250, 1, 250,  new Date('2019-09-15'), 250, new Date('2019-09-15'), 2, new Date('2019-09-15') ],
                      ['PO-1234', 'Rev 1', 1, 'mtlCode', 1000, 'MTR', '12"', 'S40', 'Pipe SMLS', 'A106 B', '', new Date('2019-09-15'), new Date('2019-09-15'), 'SO-123', 1, 'Vallourec', new Date('2019-09-15'), 250, 1, 250,  new Date('2019-09-15'), 250, new Date('2019-09-15'), 2, new Date('2019-09-15') ],                     
                    ],
                  });
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

// function fieldsFiltered(resDocField) {
//   resDocField.filter(field => {
//     field.location === 'Line'
//   })
// }

// function lines(resProject, resDocField) {
//   return resProject.pos.map(async po => {
//     if (po.subs) {
//       po.subs.map(async sub => {
//         resDocField.map(async docField => {
//           const resField = await Field.findById(docField.fieldId);
//           if (resField.fromTbl === 'po') {
//             switch (resField.type) {
//               case "String":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               case "Number":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               case "Date":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               default:
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//             }
//           } else if (resField.fromTbl === 'sub') {
//             switch (resField.type) {
//               case "String":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               case "Number":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               case "Date":
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//               break;
//               default:
//                 var obj = {
//                   text: resField.custom,
//                   address: getFieldAddress(docField, resDocDef),
//                   worksheet: getFieldSheet(docField)
//                 }
//                 return obj;
//             }            
//           }
//         });
//       });
//     }
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




module.exports = router;