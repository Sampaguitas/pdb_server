var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
var s3bucket = require('../../middleware/s3bucket');
fs = require('fs');
const fault = require('../../utilities/Errors'); //../utilities/Errors
const FieldName = require('../../models/FieldName');
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
var Excel = require('exceljs');
fs = require('fs');
var _ = require('lodash');

router.post('/', upload.single('file'), function (req, res) {
  
  const projectId = req.body.projectId;
  const file = req.file;

  let promises = [];
  let resPromises = [];
  let poQuery = {};

  let tempPo = {};
  let tempSub = {};
  // let tempColliPack = {};
  // let tempPackItem = {};
  
  let rejections = [];
  let nProcessed = 0;
  let nRejected = 0;
  let nAdded = 0;
  let nEdited = 0;
  
  if (!projectId || !file) {
    res.status(400).json({
      message: 'file or projectId missing',
      rejections: rejections,
      nProcessed: nProcessed,
      nRejected: nRejected,
      nAdded: nAdded,
      nEdited: nEdited
    });
  } else {
    FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
    .populate('fields')
    .sort({forShow:'asc'})
    .exec(function (errFieldNames, resFieldNames) {
      if (errFieldNames || !resFieldNames) {
        return res.status(400).json({
            message: 'an error occured',
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
              message: 'the Duf File seams to be empty',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
              nEdited: nEdited
            });
          } else {

            (async function() {
              for (let row = 2; row < worksheet.rowCount + 1 ; row++) {

                promises = [];

                //initialise objects
                for (var member in tempPo) delete tempPo[member];
                for (var member in tempSub) delete tempSub[member];
                // for (var member in tempColliPack) delete tempColliPack[member];
                // for (var member in tempPackItem) delete tempPackItem[member];
                
                //assign projectId
                tempPo.projectId = projectId;

                resFieldNames.map(function (resFieldName, index) {
                  let cell = alphabet(resFieldName.forShow) + row;
                  let fromTbl = resFieldName.fields.fromTbl;
                  let type = resFieldName.fields.type;
                  let key = resFieldName.fields.name;
                  let value = worksheet.getCell(cell).value;
                  
                  promises.push(testLength(row, cell, key, value));
                  promises.push(testFormat(row, cell, type, value));
                  
                  switch (fromTbl) {
                    case 'po':
                      tempPo[key] = value;
                      break;
                    case 'sub':
                      tempSub[key] = value;
                      break;
                    // case 'collipack':
                    //     tempColliPack[key] = value;
                    //   break;
                    // case 'packitem':
                    //     tempPackItem[key] = value;
                    //     break;
                    // default: console.log('not in table Po or Table Sub')
                  }
                });

                await Promise.all(promises).then(async () => {

                  if (!isidentifiable(tempPo)) {
                    rejections.push({row: row, reason: 'Table PO should have a Client PO, Rev, Item Nr or VL SO and Item Nr'});
                    nRejected++;
                  } else {

                    //reset poQuery object
                    for (var member in poQuery) delete poQuery[member];

                    if (tempPo.vlSo && tempPo.vlSoItem) {
                      poQuery = {
                        projectId: projectId, 
                        vlSo: tempPo.vlSo, 
                        vlSoItem: tempPo.vlSoItem
                      };
                    } else {
                      poQuery = {
                        projectId: projectId,
                        clPo: tempPo.clPo,
                        clPoRev: tempPo.clPoRev,
                        clPoItem: tempPo.clPoItem,
                        clCode: tempPo.clCode
                      };
                    }

                    await Po.findOne(poQuery, async function (errCurrentPo, resCurrentPo) {
                      if (errCurrentPo) {
                        rejections.push({row: row, reason: 'Fields from Table Po could not be saved.'});
                        nRejected++;
                      } else {
                        await Po.findOneAndUpdate(poQuery, tempPo, { new: true, upsert: true}, async function(errNewPo, resNewPo){
                          if (errNewPo || !resNewPo) {
                            rejections.push({row: row, reason: 'Fields from Table Po could not be saved.'});
                            nRejected++;
                          } else {
                            tempSub.poId = resNewPo._id;
                            await Sub.findOneAndUpdate({poId: resNewPo._id}, tempSub,{ new: true, upsert: true }, function(errNewSub, resNewSub) {
                              if (errNewSub || !resNewSub) {
                                rejections.push({row: row, reason: 'Fields from Table Sub could not be saved.'});
                                nRejected++;
                              } else {
                                if (!_.isEmpty(resCurrentPo)) {
                                  nEdited++;
                                } else {
                                  nAdded++;
                                }
                        //         if (_.isEmpty(tempColliPack) && _.isEmpty(tempPackItem)) {
                        //           if (!_.isEmpty(resCurrentPo)) {
                        //             nEdited++;
                        //           } else {
                        //             nAdded++;
                        //           }
                        //         } else {
                        //           let plNr = tempColliPack.plNr || packitem.plNr || '';
                        //           let colliNr = tempColliPack.colliNr || packitem.colliNr || '';
                        //           if (!plNr || !colliNr) {
                        //             if (!_.isEmpty(resCurrentPo)) {
                        //               rejections.push({row: row, reason: 'Table ColliPack should have a PL Nr && Colli Nr'});
                        //               nRejected++;
                        //             } else {
                        //               rejections.push({row: row, reason: 'Table ColliPack should have a PL Nr && Colli Nr'});
                        //               nRejected++;
                        //             }
                        //           } else {
                        //             tempColliPack.plNr = plNr;
                        //             tempColliPack.colliNr = colliNr;
                        //             tempColliPack.projectId = projectId;

                        //             let colliPackQuery = new Object;
                        //             colliPackQuery = {
                        //               plNr: plNr,
                        //               colliNr: colliNr,
                        //               projectId: projectId
                        //             }
                                    
                        //             ColliPack.findOneAndUpdate(colliPackQuery, tempColliPack, { new: true, upsert: true}, function(errNewColliPack, resNewColliPack){
                        //               if (errNewColliPack || !resNewColliPack) {
                        //                 rejections.push({row: row, reason: 'Fields from Table ColliPack could not be saved.'});
                        //                 nRejected++;
                        //               } else {
                        //                 tempPackItem.plNr = plNr;
                        //                 tempPackItem.colliNr = colliNr;
                        //                 tempPackItem.packId = resNewColliPack._id;
                        //                 tempPackItem.subId = resNewSub._id;
                        //                 tempPackItem.projectId = projectId;
                                        
                        //                 let packItemQuery = new Object;
                        //                 packItemQuery = {
                        //                   plNr: plNr,
                        //                   colliNr: colliNr,
                        //                   packId: resNewColliPack._id,
                        //                   subId: resNewSub._id,
                        //                   projectId: projectId
                        //                 }

                        //                 PackItem.findOneAndUpdate(packItemQuery, tempColliPack, { new: true, upsert: true}, function(errNewColliPack, resNewColliPack){
                        //                   if (errNewColliPack || !resNewColliPack) {
                        //                     rejections.push({row: row, reason: 'Fields from Table PackItem could not be saved.'});
                        //                     nRejected++;
                        //                   } else {
                        //                     if (!_.isEmpty(resCurrentPo)) {
                        //                       nEdited++;
                        //                     } else {
                        //                       nAdded++;
                        //                     }
                        //                   }
                        //                 });
                        //               }
                        //             });
                        //           }
                        //         }
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                }).catch(errPromises => {
                  rejections.push(errPromises)
                  nRejected++
                });
                nProcessed++;
                // console.log('nProcessed:', nProcessed);
              } //end for loop
              // console.log('after loop');
              // console.log('rejections:', rejections);
              // console.log('nProcessed:', nProcessed);
              // console.log('nRejected:', nRejected);
              // console.log('nAdded:', nAdded);
              // console.log('nEdited:', nEdited);
              return res.status(200).json({
                  rejections: rejections,
                  nProcessed: nProcessed,
                  nRejected: nRejected,
                  nAdded: nAdded,
                  nEdited: nEdited
              });
            })();
          }
        }).catch( () => {
          // console.log('message:', 'could not load the workbook');
          // console.log('rejections:', rejections);
          // console.log('rejections:', nProcessed);
          // console.log('rejections:', nRejected);
          // console.log('rejections:', nAdded);
          // console.log('rejections:', nEdited);
          return res.status(400).json({
              message: 'could not load the workbook',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
              nEdited: nEdited
          });
        });
      }
    })
  }


  function isidentifiable(tempPo) {
    if ( (!tempPo.vlSo || !tempPo.vlSoItem) && (!tempPo.clPo || !tempPo.clPoRev || !tempPo.clPoItem || !tempPo.clCode) ) {
        return false;
    } else {
      return true;
    } 
  }

  function testLength(row, cell, key, value) {
    return new Promise (function (resolve, reject) {
      switch (key) {
        case 'rev':
        case 'size':
        case 'sch':
        case 'qty':
          if ((!_.isNull(value) && !_.isUndefined(value)) && value.toString().Length > 25){
            reject({row: row, reason: `cell ${cell} exceeds maxium length set to 25 characters`});
          } else {
            resolve();
          } 
          break;
        case 'kind':
            if ((!_.isNull(value) && !_.isUndefined(value)) && value.toString().Length > 15){
              reject({row: row, reason: `cell ${cell} exceeds maxium length set to 15 characters`});
            } else {
              resolve();
            } 
            break;
        case 'manufacturer':
        case 'manufOrigin':
        case 'destination':
        case 'vlSo':
            if ((!_.isNull(value) && !_.isUndefined(value)) && value.toString().Length > 50){
              reject({row: row, reason: `cell ${cell} exceeds maxium length set to 50 characters`});
            } else {
              resolve();
            } 
            break;
        default: resolve();
      }
    });
  }
});

function testFormat(row, cell, type, value) {
  return new Promise(function (resolve, reject) {
    switch (type){
      case 'Number':
        if ((!_.isNull(value) && !_.isUndefined(value)) && !_.isNumber(value)) {
          reject({row: row, reason: `cell ${cell} is not a Number`});
        } else {
          resolve();
        }
      case 'Date':
        if((!_.isNull(value) && !_.isUndefined(value)) && !_.isDate(value)) {
          reject({row: row, reason: `cell ${cell} is not a Date`});
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

function resolve(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : null
  }, obj || self)
}

module.exports = router;




