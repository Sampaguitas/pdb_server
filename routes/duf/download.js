var express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors'); //../utilities/Errors
const FieldName = require('../../models/FieldName');
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
  const projectId = req.query.projectId;

    FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
    .populate('fields')
    .sort({forShow:'asc'})
    .exec(function (errFieldNames, resFieldNames) {
        if (errFieldNames) {
            return res.status(400).json({message: errFieldNames})
        } else if (!resFieldNames) {
            return res.status(400).json({message: 'an error occured'});
        } else {
            workbook = new Excel.Workbook();
            // workbook.properties.date1904 = true;
            var worksheet = workbook.addWorksheet('My Sheet');
            if (!!resFieldNames.length) {
                worksheet.getRow(1).height = 30;
                resFieldNames.map(resFieldName => {
                    if(resFieldName.forShow > 0) {
                        let cell = worksheet.getCell(`${alphabet(resFieldName.forShow) + 1}`);
                        with (cell) {
                            value = resFieldName.fields.custom,
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
                    }
                })
            }
            workbook.xlsx.write(res);
        }
    });
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