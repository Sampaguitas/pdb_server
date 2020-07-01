var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
    let fieldnames = [
        { forShow: 1, fields: { type: 'String', name: 'clCode', custom: 'Client Code', fromTbl: 'po' }},
        { forShow: 2, fields: { type: 'Number', name: 'inspQty', custom: 'Qty', fromTbl: 'heatloc' }},
        { forShow: 3, fields: { type: 'String', name: 'uom', custom: 'Qty Unit', fromTbl: 'po' }},
        { forShow: 4, fields: { type: 'Date', name: 'transDate', custom: 'Date', fromTbl: 'transaction' }},
        { forShow: 5, fields: { type: 'String', name: 'remarks', custom: 'Remarks', fromTbl: 'po' }},
        { forShow: 6, fields: { type: 'Number', name: 'plNr', custom: 'waybill No', fromTbl: 'packitem' }},
        { forShow: 7, fields: { type: 'String', name: 'colliNr', custom: 'waybill Item', fromTbl: 'packitem' }},
        { forShow: 8, fields: { type: 'String', name: 'supplier', custom: 'Contractor', fromTbl: 'po' }},
        { forShow: 9, fields: { type: 'String', name: 'warehouse', custom: 'Warehouse', fromTbl: 'warehouse' }},
        { forShow: 10, fields: { type: 'String', name: 'location', custom: 'Location', fromTbl: 'location' }},
        { forShow: 11, fields: { type: 'String', name: 'cif', custom: 'CIF', fromTbl: 'heatloc' }},
        { forShow: 12, fields: { type: 'String', name: 'heatNr', custom: 'Heat No', fromTbl: 'heatloc' }},
    ];
    workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.getRow(1).height = 30;
    fieldnames.map(fieldname => {
        let cell = worksheet.getCell(`${alphabet(fieldname.forShow) + 1}`);
        with (cell) {
            value = fieldname.fields.custom,
            style = Object.create(cell.style), //shallow-clone the style, break references
            border ={
                top: {style:'hair'},
                left: {style:'hair'},
                bottom: {style:'thick'},
                right: {style:'hair'}                
            },
            fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '0070C0'}
            },
            font = {
                name: 'Calibri',
                color: { argb: 'FFFFFF'},
                family: 2,
                size: 11,
                bold: true
            },
            alignment = {
                vertical: 'middle',
                horizontal: 'left'
            }
        }
    })
    workbook.xlsx.write(res);
//   const projectId = req.query.projectId;

//     FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
//     .populate('fields')
//     .sort({forShow:'asc'})
//     .exec(function (errFieldNames, resFieldNames) {
//         if (errFieldNames) {
//             return res.status(400).json({message: errFieldNames})
//         } else if (!resFieldNames) {
//             return res.status(400).json({message: 'an error occured'});
//         } else {
//             workbook = new Excel.Workbook();
//             // workbook.properties.date1904 = true;
//             var worksheet = workbook.addWorksheet('My Sheet');
//             if (!!resFieldNames.length) {
//                 worksheet.getRow(1).height = 30;
//                 resFieldNames.map(resFieldName => {
//                     if(resFieldName.forShow > 0) {
//                         let cell = worksheet.getCell(`${alphabet(resFieldName.forShow) + 1}`);
//                         with (cell) {
//                             value = resFieldName.fields.custom,
//                             style = Object.create(cell.style), //shallow-clone the style, break references
//                             border ={
//                                 top: {style:'hair'},
//                                 left: {style:'hair'},
//                                 bottom: {style:'thick'},
//                                 right: {style:'hair'}                
//                             },
//                             fill = {
//                                 type: 'pattern',
//                                 pattern: 'solid',
//                                 fgColor: { argb: '0070C0'}
//                             },
//                             font = {
//                                 name: 'Calibri',
//                                 color: { argb: 'FFFFFF'},
//                                 family: 2,
//                                 size: 11,
//                                 bold: true
//                             },
//                             alignment = {
//                                 vertical: 'middle',
//                                 horizontal: 'left'
//                             }
//                         }
//                     }
//                 })
//             }
//             workbook.xlsx.write(res);
//         }
//     });
});

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

module.exports = router;