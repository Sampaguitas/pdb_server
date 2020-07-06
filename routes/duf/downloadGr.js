var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
    let fieldnames = [
        { forShow: 1, field: { type: 'String', name: 'clCode', custom: 'Client Code'}},
        { forShow: 2, field: { type: 'Number', name: 'inspQty', custom: 'Qty'}},
        { forShow: 3, field: { type: 'Date', name: 'dateReturn', custom: 'Date Returned'}},
        { forShow: 4, field: { type: 'String', name: 'remarks', custom: 'Remarks'}},
        { forShow: 5, field: { type: 'String', name: 'waybillNr', custom: 'Waybill Nr'}},
        { forShow: 6, field: { type: 'String', name: 'waybillItem', custom: 'Waybill Item'}},
        { forShow: 7, field: { type: 'String', name: 'contractor', custom: 'Contractor'}},
        { forShow: 8, field: { type: 'String', name: 'warehouse', custom: 'Warehouse'}},
        { forShow: 9, field: { type: 'String', name: 'location', custom: 'Location'}},
        { forShow: 10, field: { type: 'String', name: 'cif', custom: 'CIF'}},
        { forShow: 11, field: { type: 'String', name: 'heatNr', custom: 'Heat No'}},
    ];
    workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.getRow(1).height = 30;
    fieldnames.map(fieldname => {
        let cell = worksheet.getCell(`${alphabet(fieldname.forShow) + 1}`);
        with (cell) {
            value = fieldname.field.custom,
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