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

  let colPromises = [];
  let rowPromises = [];

  let tempPo = {};
  let tempSub = {};
  
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
        console.log('an error has occured');
        return res.status(400).json({
            message: 'an error has occured',
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
          } else if (rowCount > 800) {
            return res.status(400).json({
              message: 'try to upload less rows than 800 rows at the time',
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
                for (var member in tempPo) delete tempPo[member];
                for (var member in tempSub) delete tempSub[member];
                
                //assign projectId
                tempPo.projectId = projectId;

                resFieldNames.map(resFieldName => {
                  let cell = alphabet(resFieldName.forShow) + row;
                  let fromTbl = resFieldName.fields.fromTbl;
                  let type = resFieldName.fields.type;
                  let key = resFieldName.fields.name;
                  let value = worksheet.getCell(cell).value;
                  
                  colPromises.push(testLength(row, cell, key, value));
                  colPromises.push(testFormat(row, cell, type, value));
                  
                  switch (fromTbl) {
                    case 'po':
                      tempPo[key] = value;
                      break;
                    case 'sub':
                      tempSub[key] = value;
                      break;
                  }
                });// end map

                await Promise.all(colPromises).then( async () => {
                  rowPromises.push(upsert(projectId, row, tempPo, tempSub));
                }).catch(errPromises => {
                  console.log(`line ${row} nRejected`);
                  rejections.push(errPromises)
                  nRejected++;
                });//end colPromises.all promise

                nProcessed++;
              } //end for loop

              await Promise.all(rowPromises).then(resRowPromises => {
                console.log('inside Promise.all(rowPromises)');
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
              message: 'could not load the workbook.',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
              nEdited: nEdited
          });
        });//end wb load promise
      }
    })
  }

  function upsert(projectId, row, tempPo, tempSub) {
    return new Promise (function (resolve, reject) {
      let poQuery = {};
      
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

      if ( (!tempPo.vlSo || !tempPo.vlSoItem) && (!tempPo.clPo || !tempPo.clPoRev || !tempPo.clPoItem || !tempPo.clCode) ) {
        resolve({
          row: row,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Table PO should have a Client PO, Rev, Item Nr or VL SO and Item Nr.'
        });
      } else {
        Po.findOneAndUpdate(poQuery, tempPo, { new: true, upsert: true, rawResult: true}, function(errNewPo, resNewPo){
          if (errNewPo || !resNewPo) {
            resolve({
              row: row,
              isRejected: true,
              isEdited: false,
              isAdded: false,
              reason: 'Fields from Table Po could not be saved.'
            });
          } else {
            //assign poId
            tempSub.poId = resNewPo.value._id;
            Sub.findOneAndUpdate({poId: resNewPo.value._id}, tempSub,{ new: true, upsert: true }, function(errNewSub, resNewSub) {
              if (errNewSub || !resNewSub) {
                resolve({
                  row: row,
                  isRejected: true,
                  isEdited: false,
                  isAdded: false,
                  reason: 'Fields from Table Sub could not be saved.'
                });
              } else {
                if (resNewPo.lastErrorObject.updatedExisting) {
                  resolve({
                    row: row,
                    isRejected: false,
                    isEdited: true,
                    isAdded: false,
                    reason: ''
                  });
                } else {
                  resolve({
                    row: row,
                    isRejected: false,
                    isEdited: false,
                    isAdded: true,
                    reason: ''
                  });
                }
              }
            });
          }
        });
      }
    });
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

module.exports = router;




