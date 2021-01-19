var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
fs = require('fs');
const Warehouse = require('../../models/Warehouse');
const Area = require('../../models/Area');
const Location = require('../../models/Location');
var Excel = require('exceljs');
var _ = require('lodash');

router.post('/', upload.single('file'), function (req, res) {
  
  const projectId = req.body.projectId;
  const file = req.file;

  let fieldnames = [
    { forShow: 1, fields: { type: 'String', name: 'warehouse', custom: 'Warehouse', fromTbl: 'location' }},
    { forShow: 2, fields: { type: 'String', name: 'areaNr', custom: 'Area Nr', fromTbl: 'location' }},
    { forShow: 3, fields: { type: 'String', name: 'area', custom: 'Area Name', fromTbl: 'location' }},
    { forShow: 4, fields: { type: 'String', name: 'hall', custom: 'Sub Area/Hall', fromTbl: 'location' }},
    { forShow: 5, fields: { type: 'String', name: 'row', custom: 'Row', fromTbl: 'location' }},
    { forShow: 6, fields: { type: 'String', name: 'col', custom: 'Location/Col', fromTbl: 'location' }},
    { forShow: 7, fields: { type: 'String', name: 'height', custom: 'Depth/Height', fromTbl: 'location' }},
    { forShow: 8, fields: { type: 'String', name: 'tc', custom: 'TC', fromTbl: 'location' }},
    { forShow: 9, fields: { type: 'String', name: 'type', custom: 'Loc Type', fromTbl: 'location' }},
  ];


  let colPromises = [];
  let rowPromises = [];

  let tempWh = {};
  let tempArea = {};
  let tempLoc = {};
  
  let rejections = [];
  let nProcessed = 0;
  let nRejected = 0;
  let nAdded = 0;
  let nEdited = 0;

  let nonPrintable = /[\t\r\n]/mg;
  
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

        (async function() {
          for (let row = 2; row < rowCount + 1 ; row++) {

            colPromises = [];

            //initialise objects
            for (var member in tempWh) delete tempWh[member];
            for (var member in tempArea) delete tempArea[member];
            for (var member in tempLoc) delete tempLoc[member];
            
            //assign projectId
            tempWh.projectId = projectId;

            fieldnames.map(fieldname => {
              let cell = alphabet(fieldname.forShow) + row;
              let fromTbl = fieldname.fields.fromTbl;
              let type = fieldname.fields.type;
              let key = fieldname.fields.name;
              let value = worksheet.getCell(cell).value
              
              if (type === 'String' && value === 0) {
                value = '0'
              } else if (nonPrintable.test(value)) {
                value = value.replace(nonPrintable, '');
              }
              
              colPromises.push(testFormat(row, cell, type, value));
              
              switch (fromTbl) {
                case 'location':
                  if (['warehouse'].includes(key)) {
                    tempWh[key] = value;
                  } else if (['areaNr', 'area'].includes(key)) {
                    tempArea[key] = value;
                  } else if (['hall', 'row', 'col', 'height', 'tc', 'type'].includes(key)) {
                    tempLoc[key] = value;
                  }
                  break;
              }
            });// end map

            await Promise.all(colPromises).then( async () => { //async 
              rowPromises.push(upsert(row, tempWh, tempArea, tempLoc));
            }).catch(errPromises => {
              if(!_.isEmpty(errPromises)) {
                rejections.push(errPromises);
              }
              nRejected++;
            });//end colPromises.all promise
            nProcessed++;
          } //end for loop

          await Promise.all(rowPromises).then(resRowPromises => {
            resRowPromises.map(r => {
              if (r.isRejected) {
                rejections.push({row: r.row, reason: r.reason});
                nRejected++;
              } else if(r.isEdited) {
                nEdited++;
              } else {
                nAdded++;
              }
            });//end parse resRowPromise
            return res.status(200).json({
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
              nEdited: nEdited
            });
          }).catch( () => {
            return res.status(400).json({
              message: 'An error has occured during the upload.',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
              nEdited: nEdited
            });
          });//end rowPromise.all promise
          
        })();//end async function
      }
    }).catch( () => {
      return res.status(400).json({
          message: 'Could not load the workbook.',
          rejections: rejections,
          nProcessed: nProcessed,
          nRejected: nRejected,
          nAdded: nAdded,
          nEdited: nEdited
      });
    });//end wb load promise
  }

  function upsert(fileRow, tempWh, tempArea, tempLoc) {
    return new Promise (function (resolve, reject) {
      
      let projectId = tempWh.projectId;
      let warehouse = tempWh.warehouse;
      let areaNr = tempArea.areaNr;
      let area = tempArea.area;
      let hall = tempLoc.hall;
      let row = tempLoc.row;
      let col = tempLoc.col;
      let height = tempLoc.height;
      let tc = tempLoc.tc;
      let type = tempLoc.type;
      
      if (!warehouse) {
        resolve({
          row: fileRow,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Warehouse should not be empty.'
        });
      } else if (!area || !areaNr) {
        resolve({
          row: fileRow,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Area Nr and Area Name should not be empty.'
        });
      } else if (!hall || !row || !col || !tc || !type) {
        resolve({
          row: fileRow,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Sub Area/Hall, Row, Location/Col, TC and Loc Type should not be empty.'
        });
      } else {

        let filterWh = { projectId: projectId, warehouse: warehouse};
        let updateWh = { projectId: projectId, warehouse: warehouse};

        Warehouse.findOneAndUpdate(filterWh, updateWh, { new: true, upsert: true }, function (errNewWh, resNewWh) {
          if(errNewWh || !resNewWh) {
            resolve({
              row: fileRow,
              isRejected: true,
              isEdited: false,
              isAdded: false,
              reason: 'Fields from Table Warehouse could not be saved.'
            });
          } else {

            let warehouseId = resNewWh._id;
            let filterArea = { warehouseId: warehouseId, area: area, areaNr: areaNr }
            let updateWh = { warehouseId: warehouseId, area: area, areaNr: areaNr }

            Area.findOneAndUpdate(filterArea, updateWh, { new: true, upsert: true }, function(errNewArea, resNewArea) {
              if(errNewArea || !resNewArea) {
                resolve({
                  row: fileRow,
                  isRejected: true,
                  isEdited: false,
                  isAdded: false,
                  reason: 'Fields from Table Area could not be saved.'
                });
              } else {

                let areaId = resNewArea._id;
                let filterLoc = { hall: hall, row: row, col: col, height: height || '', areaId: areaId };
                let updateLoc = { hall: hall, row: row, col: col, height: height || '', tc: tc, type: type, areaId: areaId };

                Location.findOneAndUpdate(filterLoc, updateLoc, { new: true, upsert: true, rawResult: true }, function(errNewLoc, resNewLoc) {
                  if (errNewLoc || !resNewLoc) {
                    resolve({
                      row: fileRow,
                      isRejected: true,
                      isEdited: false,
                      isAdded: false,
                      reason: 'Fields from Table Location could not be saved.'
                    });
                  } else if (resNewLoc.lastErrorObject.updatedExisting) {
                    resolve({
                      row: fileRow,
                      isRejected: false,
                      isEdited: true,
                      isAdded: false,
                      reason: ''
                    });
                  } else {
                    resolve({
                      row: fileRow,
                      isRejected: false,
                      isEdited: false,
                      isAdded: true,
                      reason: ''
                    });
                  }
                });
              }
              
            });
          }
        });
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




