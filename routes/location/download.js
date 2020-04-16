var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
    let fieldnames = [
        { forShow: 1, fields: { type: 'String', name: 'warehouse', custom: 'Warehouse', fromTbl: 'location' }},
        { forShow: 2, fields: { type: 'String', name: 'areaNr', custom: 'Area Nr', fromTbl: 'location' }},
        { forShow: 2, fields: { type: 'String', name: 'area', custom: 'Area Name', fromTbl: 'location' }},
        { forShow: 3, fields: { type: 'String', name: 'hall', custom: 'Sub Area/Hall', fromTbl: 'location' }},
        { forShow: 4, fields: { type: 'String', name: 'row', custom: 'Row', fromTbl: 'location' }},
        { forShow: 5, fields: { type: 'String', name: 'col', custom: 'Location/Col', fromTbl: 'location' }},
        { forShow: 6, fields: { type: 'String', name: 'height', custom: 'Depth/Height', fromTbl: 'location' }},
        { forShow: 7, fields: { type: 'String', name: 'tc', custom: 'TC', fromTbl: 'location' }},
        { forShow: 8, fields: { type: 'String', name: 'type', custom: 'Loc Type', fromTbl: 'location' }},
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