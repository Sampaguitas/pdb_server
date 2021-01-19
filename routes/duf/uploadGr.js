var express = require('express');
var mongoose = require('mongoose');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
fs = require('fs');
var _ = require('lodash');
var Excel = require('exceljs');
const { stringify } = require('querystring');
const { reject, resolve } = require('bluebird');
let PO = require('../../models/Po');
const Warehouse = require('../../models/Warehouse');
const Area = require('../../models/Area');
const Certificate = require('../../models/Certificate');
const Return = require('../../models/Return');
const Transaction = require('../../models/Transaction');
const Heat = require('../../models/Heat');
const HeatLoc = require('../../models/HeatLoc');
// nonPrintable.test(value)
// value.replace(nonPrintable, '');

router.post('/', upload.single('file'), function (req, res) {
  const projectId = req.body.projectId;
  const file = req.file;


  let fieldnames = [
    { forShow: 1, field: { type: 'String', name: 'clCode', custom: 'Client Code'}},
    { forShow: 2, field: { type: 'Number', name: 'inspQty', custom: 'Qty Returned'}},
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

  let myPromises = [];
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
    workbook.xlsx.load(file.buffer).then(async wb => {

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
      } else if (rowCount > 1001) {
        return res.status(400).json({
          message: 'Try to upload less than 1000 rows at the time.',
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

          if(!line.clCode) {
              nRejected++;
              rejections.push({row: row, reason: 'Client Code is compulsory.'});
          } else if (!line.inspQty) {
            nRejected++;
            rejections.push({row: row, reason: 'Qty Returned is compulsory.'});
          } else if (!line.contractor) {
            nRejected++;
            rejections.push({row: row, reason: 'Contractor is compulsory.'});
          } else if (!line.waybillNr) {
            nRejected++;
            rejections.push({row: row, reason: 'Waybill Nr is compulsory.'});
          } else if (!line.waybillItem) {
            nRejected++;
            rejections.push({row: row, reason: 'Waybill Item is compulsory.'});
          } else if (!line.warehouse) {
            nRejected++;
            rejections.push({row: row, reason: 'Warehouse is compulsory.'});
          } else if (!line.location) {
            nRejected++;
            rejections.push({row: row, reason: 'Location is compulsory.'});
          } else if (!/\d{1}\/\d{2}-\d{3}(-\d{1})?/g.test(line.location)) {
            nRejected++;
            rejections.push({row: row, reason: 'Location is not formated properly'});
          } else {
            await testLine(row, fieldnames, line).then( async () => {
              await getLocationId(line.warehouse, line.location, projectId).then(async locationId => {
                await getCertificateId(line.cif, projectId).then(async certificateId => {
                  let foundPo = pos.find(element => element.clCode === line.clCode);
                  if (!foundPo) {
                    await getPo(line.clCode, projectId).then(resPo => {
                      let returnId = mongoose.Types.ObjectId();
                      pos.push({
                        _id: resPo.poId,
                        clCode: line.clCode,
                        uom: resPo.uom,
                        projectId: projectId,
                        returns: [
                          {
                            _id: returnId,
                            qtyReturn: line.inspQty,
                            dateReturn: line.dateReturn,
                            remarks: line.remarks,
                            waybillNr: line.waybillNr,
                            waybillItem: line.waybillItem,
                            contractor: line.contractor,
                            poId: resPo.poId,
                            transactions: [
                              {
                                transQty: line.inspQty,
                                transDate: line.dateReturn,
                                transType: 'Return',
                                transComment: `WayBill ${line.waybillNr} item ${line.waybillItem} ${line.contractor} Returned: ${line.inspQty} ${resPo.uom}`,
                                warehouse: line.warehouse,//
                                location: line.location,//
                                locationId: locationId,
                                poId: resPo.poId,
                                returnId: returnId,
                                projectId: projectId,
                                heatlocs: (!line.cif || !line.heatNr) ? [] : [
                                  {
                                    cif: line.cif,
                                    heatNr: line.heatNr,
                                    inspQty: line.inspQty,
                                    poId: resPo.poId,
                                    locationId: locationId,
                                    projectId: projectId
                                  }
                                ]
                              }
                            ],
                            heats: (!line.heatNr || !certificateId) ? [] : [
                              {
                                // cif: line.cif, //
                                heatNr: line.heatNr,
                                inspQty: line.inspQty,
                                poId: resPo.poId,
                                returnId: returnId,
                                certificateId: certificateId,
                              }
                            ]
                          }
                        ]
                      });
                    }).catch(r => {
                      nRejected++,
                      rejections.push({row: row, reason: r.reason})
                    });
                  } else {
                    let foundReturn = foundPo.returns.find(element => element.waybillNr === line.waybillNr && element.waybillItem === line.waybillItem);
                    if (!foundReturn) {
                      let returnId = mongoose.Types.ObjectId();
                      foundPo.returns.push({
                        _id: returnId,
                        qtyReturn: line.inspQty,
                        dateReturn: line.dateReturn,
                        remarks: line.remarks,
                        waybillNr: line.waybillNr,
                        waybillItem: line.waybillItem,
                        contractor: line.contractor,
                        poId: foundPo._id,
                        transactions: [
                          {
                            transQty: line.inspQty,
                            transDate: line.dateReturn,
                            transType: 'Return',
                            transComment: `WayBill ${line.waybillNr} item ${line.waybillItem} ${line.contractor} Returned: ${line.inspQty} ${foundPo.uom}`,
                            warehouse: line.warehouse,//
                            location: line.location,//
                            locationId: locationId,
                            poId: foundPo._id,
                            returnId: returnId,
                            projectId: projectId,
                            heatlocs: (!line.cif || !line.heatNr) ? [] : [
                              {
                                cif: line.cif,
                                heatNr: line.heatNr,
                                inspQty: line.inspQty,
                                poId: foundPo._id,
                                locationId: locationId,
                                projectId: projectId
                              }
                            ]
                          }
                        ],
                        heats: (!line.heatNr || !certificateId) ? [] : [
                          {
                            // cif: line.cif, //
                            heatNr: line.heatNr,
                            inspQty: line.inspQty,
                            poId: foundPo._id,
                            returnId: returnId,
                            certificateId: certificateId,
                          }
                        ]
                      });
                    } else {
                      foundReturn.qtyReturn += line.inspQty;
                      if(!!line.warehouse && !!line.location) {
                        let foundTransaction = foundReturn.transactions.find(element => {
                          return element.warehouse === line.warehouse && element.location === line.location
                        });
                        if (!foundTransaction) {
                          foundReturn.transactions.push({
                            transQty: line.inspQty,
                            transDate: line.dateReturn,
                            transType: 'Return',
                            transComment: `WayBill ${line.waybillNr} item ${line.waybillItem} ${line.contractor} Returned: ${line.inspQty} ${foundPo.uom}`,
                            warehouse: line.warehouse,//
                            location: line.location,//
                            locationId: locationId,
                            poId: foundPo._id,
                            returnId: foundReturn._id,
                            projectId: projectId,
                            heatlocs: (!line.cif || !line.heatNr) ? [] : [
                              {
                                cif: line.cif,
                                heatNr: line.heatNr,
                                inspQty: line.inspQty,
                                poId: foundPo._id,
                                locationId: locationId,
                                projectId: projectId
                              }
                            ]
                          });
                        } else {
                          foundTransaction.transQty += line.inspQty;
                          foundTransaction.transComment = `WayBill ${line.waybillNr} item ${line.waybillItem} ${line.contractor} Returned: ${foundTransaction.transQty + line.inspQty} ${foundPo.uom}`;
                          if (!!line.cif && !!line.heatNr) {
                            let founHeatLoc = foundTransaction.heatlocs.find(element => {
                              return element.cif === line.cif && element.heatNr === line.heatNr
                            });
                            if(!founHeatLoc) {
                              foundTransaction.heatlocs.push({
                                cif: line.cif,
                                heatNr: line.heatNr,
                                inspQty: line.inspQty,
                                poId: foundPo._id,
                                locationId: locationId,
                                projectId: projectId
                              });
                            } else {
                              founHeatLoc.inspQty += line.inspQty;
                            }
                          }
                        }
                      }
                      if (!!line.heatNr && !!certificateId) {
                        let foundHeat = foundReturn.heats.find(element => {
                          return element.heatNr === line.heatNr && _.isEqual(element._id, certificateId);
                        });
                        if (!foundHeat) {
                          foundReturn.heats.push({
                            heatNr: line.heatNr,
                            inspQty: line.inspQty,
                            poId: foundPo._id,
                            returnId: foundReturn._id,
                            certificateId: certificateId,
                          });
                        } else {
                          foundHeat.inspQty += line.inspQty;
                        }
                      }
                    }
                  }
                });
              }).catch(errLocationId => {
                nRejected++,
                rejections.push({row: row, reason: errLocationId.reason})
              });
            }).catch(errLine => {
              nRejected++,
              rejections.push({row: row, reason: errLine.reason});
            });
          }
        }
        pos.map(po => {
          po.returns.map(_return => {
            myPromises.push(createReturn(_return));
            _return.transactions.map(transaction => {
              myPromises.push(createTransaction(transaction)),
              transaction.heatlocs.map(heatloc => myPromises.push(upsertHeatLoc(heatloc)))
            });
            _return.heats.map(heat => myPromises.push(createHeat(heat)));
          });
        });
        Promise.all(myPromises).then( () => {
          res.status(nRejected? 400 : 200).json({
            message: 'Still working on this function...',
            rejections: rejections,
            nProcessed: rowCount,
            nRejected: nRejected,
            nAdded: rowCount - nRejected,
            nEdited: nEdited
          });
        });
      }
    });
  }
});

function createReturn(_return) {
  return new Promise(function(resolve) {
    Return.create(_return, function(err, res) {
      if (err) {
        resolve({
          isRejected: true
        });
      } else {
        resolve({
          isRejected: false
        });
      }
    });
  });
}

function createTransaction(transaction) {
  return new Promise(function(resolve) {
    Transaction.create(transaction, function(err) {
      if (err) {
        resolve({
          isRejected: true,
          isEdited: false,
          isAdded: false,
        });
      } else {
        resolve({
          isRejected: false,
          isEdited: false,
          isAdded: true,
        });
      }
    });
  });
}

function createHeat(heat) {
  return new Promise(function(resolve) {
    Heat.create(heat, function(err) {
      if (err) {
        resolve({
          isRejected: true,
          isEdited: false,
          isAdded: false,
        });
      } else {
        resolve({
          isRejected: false,
          isEdited: false,
          isAdded: true,
        });
      }
    });
  });
}

function upsertHeatLoc(heatloc) {
  return new Promise(function(resolve) {
    let filter = {
      projectId: heatloc.projectId,
      poId: heatloc.poId,
      locationId: heatloc.locationId,
      cif: heatloc.cif,
      heatNr: heatloc.heatNr
    };
    let update = { $inc: { inspQty: heatloc.inspQty } };
    HeatLoc.findOneAndUpdate(filter, update, { new: true, upsert: true, rawResult: true }, function (err, heatLoc) {
      if (err || !heatLoc) {
          resolve({
              isRejected: true,
              isEdited: false,
              isAdded: false,
          });
      } else if (heatLoc.lastErrorObject.updatedExisting) {
          resolve({
              isRejected: false,
              nEdited: true,
              nAdded: false,
          });
      } else {
          resolve({
              isRejected: false,
              nEdited: false,
              nAdded: true,
          });
      }
    });
  });
}

function getPo(clCode, projectId) {
  return new Promise(function(resolve, reject) {
    PO.findOneAndUpdate({clCode: clCode, projectId: projectId}, {new: true, upsert: true}, function (err, res) {
      if (!!err || !res) {
        reject({reason: 'Could not find or create PO.'});
      } else {
        resolve({poId: res._id, uom: res.uom || ''});
      }
    });
  });
}

function getLocationId(warehouse, location, projectId) {
  return new Promise(function(resolve, reject) {
    let areaNrMatch = location.match(/\d{1}(?=(\/\d{2}-\d{3}(-\d{1})?))/g);
    let hallMatch = location.match(/(?<=\d{1}\/)\d{1}(?=(\d{1}-\d{3}(-\d{1})?))/g);
    let rowMatch = location.match(/(?<=\d{1}\/\d{1})\d{1}(?=(-\d{3}(-\d{1})?))/g);
    let colMatch = location.match(/(?<=\d{1}\/\d{2}-)\d{3}(?=((-\d{1})?))/g);
    let heightMatch = location.match(/(?<=\d{1}\/\d{2}-\d{3}-)\d{1}/g);
    getWarehouseId(warehouse, projectId).then(warehouseId => {
      getAreaId(!_.isEmpty(areaNrMatch) ? areaNrMatch[0] : undefined, warehouseId).then(areaId => {
        Location.findOne({
          hall: !_.isEmpty(hallMatch) ? hallMatch[0] : undefined,
          row: !_.isEmpty(rowMatch) ? rowMatch[0] : undefined,
          col: !_.isEmpty(colMatch) ? colMatch[0] : undefined,
          height: !_.isEmpty(heightMatch) ? heightMatch[0] : undefined,
          areaId: areaId
        }, function(err, res) {
          if(!!err || !res) {
            reject({reason: 'Could not retreive locationId.'})
          } else {
            resolve(res._id);
          }
        });
      }).catch(errArea=> reject({reason: errArea.reason}))
    }).catch(errWarehouse => reject({reason: errWarehouse.reason}));
  });
}

function getWarehouseId(warehouse, projectId) {
  return new Promise(function(resolve, reject) {
    Warehouse.findOne({warehouse: warehouse, projectId: projectId}, function(err, res) {
      if(!!err || !res) {
        reject({reason: 'Could not retreive warehouseId.'})
      } else {
        resolve(res._id);
      }
    });
  });
}

function getAreaId(areaNr, warehouseId) {
  return new Promise(function(resolve, reject) {
    if (_.isUndefined(areaNr)) {
      reject({reason: 'Could not retreive areaId'});
    } else {
      Area.findOne({areaNr: areaNr, warehouseId: warehouseId}, function(err, res) {
        if (!!err || !res) {
          reject({reason: 'Could not retreive areaId'});
        } else {
          resolve(res._id);
        }
      });
    }
  });
}

function getCertificateId(cif, projectId) {
  return new Promise(function(resolve) {
    if (!cif) {
      resolve();
    } else {
      Certificate.findOneAndUpdate({cif: cif, projectId: projectId},{new: true, upsert: true }, function(err, res) {
        if (!!err || !res) {
          resolve();
        } else {
          resolve(res._id);
        }
      });
    }
  });
}

function testLine(row, fieldnames, line) {
  return new Promise(function(resolve, reject) {
    let cellPromises = [];
    fieldnames.map(fieldname => cellPromises.push(testFormat(row, fieldname.forShow, fieldname.field.type, line[fieldname.field.name])));
    Promise.all(cellPromises).then( () => {
      resolve();
    }).catch(err => {
      reject({row: err.row, reason: err.reason});
    })
  });
}

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




