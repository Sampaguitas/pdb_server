var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
fs = require('fs');
// const FieldName = require('../../models/FieldName');
// const Project = require('../../models/Project');
// const Po = require('../../models/Po');
// const Sub = require('../../models/Sub');
var Excel = require('exceljs');
var _ = require('lodash');
const { stringify } = require('querystring');


// let nonPrintable = /[\t\r\n]/mg;
// nonPrintable.test(value)
// value.replace(nonPrintable, '');

router.post('/', upload.single('file'), function (req, res) {
  const projectId = req.body.projectId;
  const file = req.file;


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

  let rejections = [];
  let nProcessed = 0;
  let nRejected = 0;
  let nAdded = 0;
  let nEdited = 0;
  
  if (!projectId || !file) {
    res.status(400).json({
      message: 'File or projectId is missing.',
      rejections: rejections,
      nProcessed: nProcessed,
      nRejected: nRejected,
      nAdded: nAdded,
      nEdited: nEdited
    });
  } else {
    var workbook = new Excel.Workbook();
    workbook.xlsx.load(file.buffer).then(wb => {

      var worksheet = wb.getWorksheet(1);
      let rowCount = worksheet.rowCount;
            
      if (rowCount < 2) {
        return res.status(400).json({
          message: 'The Duf File seems to be empty.',
          rejections: rejections,
          nProcessed: nProcessed,
          nRejected: nRejected,
          nAdded: nAdded,
          nEdited: nEdited
        });
      } else if (rowCount > 801) {
        return res.status(400).json({
          message: 'Try to upload less than 800 rows at the time.',
          rejections: rejections,
          nProcessed: nProcessed,
          nRejected: nRejected,
          nAdded: nAdded,
          nEdited: nEdited
        });
      } else {

        let pos = [];
        let nonPrintable = /[\t\r\n]/mg;

        for (var row = 2; row < rowCount + 1; row++ ) {
          
          let line = fieldnames.reduce(function(acc, cur) {
            if (nonPrintable.test(worksheet.getCell(`${alphabet(cur.forShow)}${row}`).value)) {
              acc[cur.field.name] = worksheet.getCell(`${alphabet(cur.forShow)}${row}`).value.replace(nonPrintable, '');
            } else {
              acc[cur.field.name] = worksheet.getCell(`${alphabet(cur.forShow)}${row}`).value;
            }
            return acc;
          }, {});

          let foundPo = pos.find(element => element.clCode === line.clCode);
          if (!foundPo) {
            pos.push({
              clCode: line.clCode,
              returns: [
                {
                  qtyReturn: line.inspQty,
                  dateReturn: line.dateReturn,
                  remarks: line.remarks,
                  waybillNr: line.waybillNr,
                  waybillItem: line.waybillItem,
                  contractor: line.contractor,
                  heatlocs: [
                    {
                      cif: line.cif,
                      heatNr: line.heatNr,
                      inspQty: line.inspQty,
                      warehouse: line.warehouse,
                      location: line.location,
                    }
                  ]
                }
              ]
            });
          } else {
            let foundReturn = foundPo.returns.find(element => element.waybillNr === line.waybillNr && element.waybillItem === line.waybillItem);
            if (!foundReturn) {
              foundPo.returns.push({
                qtyReturn: line.inspQty,
                dateReturn: line.dateReturn,
                remarks: line.remarks,
                waybillNr: line.waybillNr,
                waybillItem: line.waybillItem,
                contractor: line.contractor,
                heatlocs: [
                  {
                    cif: line.cif,
                    heatNr: line.heatNr,
                    inspQty: line.inspQty,
                    warehouse: line.warehouse,
                    location: line.location,
                  }
                ]
              });
            } else {
              foundReturn.qtyReturn += line.inspQty;
              let foundHeatLoc = foundReturn.heatlocs.find(element => {
                return element.cif === line.cif && element.heatNr === line.heatNr && element.warehouse === line.warehouse && element.location === line.location
              });
              if (!foundHeatLoc) {
                foundReturn.heatlocs.push({
                  cif: line.cif,
                  heatNr: line.heatNr,
                  inspQty: line.inspQty,
                  warehouse: line.warehouse,
                  location: line.location,
                })
              } else {
                foundHeatLoc.inspQty += line.inspQty;
              }
            }
          }
        }
        pos.map(po => {
          po.returns.map(_return => {
            // let heats = _return.heatlocs.reduce(function(acc, cur) {
            //   acc += cur.inspQty
            //   return acc;
            // }, 0);
            // _return.qtyReturn = qtyReturn;
            console.log(_return);
          });
        });
        
        res.status(200).json({
          message: 'Still working on this function...',
          rejections: rejections,
          nProcessed: nProcessed,
          nRejected: nRejected,
          nAdded: nAdded,
          nEdited: nEdited
        })
      }
    });
  }
});

function testFormat(row, cell, type, value) {
  return new Promise(function (resolve, reject) {
    switch (type){
      case 'Number':
        if ((!_.isNull(value) && !_.isUndefined(value)) && !_.isNumber(value)) {
          reject({row: row, reason: `Cell: ${cell} is not a Number.`});
        } else {
          resolve();
        }
      break;
      case 'Date':
        if((!_.isNull(value) && !_.isUndefined(value)) && !_.isDate(value)) {
          reject({row: row, reason: `Cell: ${cell} is not a Date.`});
        } else {
          resolve();
        }
        break;
      case 'String':
        if (_.isObject(value) && value.hasOwnProperty('hyperlink')) {
          reject({row: row, reason: `Cell: ${cell} contains a Hyperlink`});
        } else if (_.isObject(value)) {
          reject({row: row, reason: `Cell: ${cell} contains invalid characters`});
        } else {
          resolve();
        }
        break;
      default: resolve();
    }
  });
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




