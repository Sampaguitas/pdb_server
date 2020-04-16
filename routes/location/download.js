var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
    let fieldNames = [
        { forShow: 1, fields: { name: 'warehouse', custom: 'Warehouse' }},
        { forShow: 2, fields: { name: 'area', custom: 'Area' }},
        { forShow: 3, fields: { name: 'hall', custom: 'Sub Area/Hall' }},
        { forShow: 4, fields: { name: 'row', custom: 'Row' }},
        { forShow: 5, fields: { name: 'col', custom: 'Location/Col' }},
        { forShow: 6, fields: { name: 'height', custom: 'Depth/Height' }},
        { forShow: 7, fields: { name: 'tc', custom: 'TC' }},
        { forShow: 8, fields: { name: 'type', custom: 'Loc Type' }},
    ];
    workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.getRow(1).height = 30;
    fieldNames.map(fieldName => {
        let cell = worksheet.getCell(`${alphabet(fieldName.forShow) + 1}`);
        with (cell) {
            value = fieldName.fields.custom,
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

module.exports = router;