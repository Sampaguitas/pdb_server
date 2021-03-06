var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
fs = require('fs');
const FieldName = require('../../models/FieldName');
const Project = require('../../models/Project');
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
var Excel = require('exceljs');
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
    // FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
    Project.findById(projectId)
    .populate({
      path: 'fieldnames',
      match: {
        screenId: '5cd2b646fd333616dc360b6d',
        forShow: {$exists: true, $nin: ['', 0]}
      },
      options: { sort: {forShow:'asc'} },
      populate: {
        path: 'fields'
      }
    })
    // .populate('fields')
    // .sort({forShow:'asc'})
    // .exec(function (errFieldNames, resFieldNames) {
    .exec(function (errProject, resProject) {
      if (errProject || !resProject) {
        return res.status(400).json({
            message: 'An error has occured, please check with your administrator.',
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
                for (var member in tempPo) delete tempPo[member];
                for (var member in tempSub) delete tempSub[member];
                
                //assign projectId
                tempPo.projectId = projectId;

                resProject.fieldnames.map(fieldname => {
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
                    case 'po':
                      // if (!['project', 'projectNr'].includes(key)) {
                      tempPo[key] = value;
                      // }
                      break;
                    case 'sub':
                      tempSub[key] = value;
                      break;
                  }
                });// end map

                await Promise.all(colPromises).then( async () => {
                  rowPromises.push(upsert(projectId, row, tempPo, tempSub, resProject.number));
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
    })
  }

  function upsert(projectId, row, tempPo, tempSub, projectNr) {
    return new Promise (function (resolve, reject) {
      let poQuery = {};
      
      if (tempPo.vlSo && tempPo.vlSoItem) {
        poQuery = {
          projectId: projectId, 
          vlSo: tempPo.vlSo, 
          vlSoItem: tempPo.vlSoItem
        };
      } else if (tempPo.clPo && tempPo.clPoRev && tempPo.clPoItem && tempPo.clCode) {
        poQuery = {
          projectId: projectId,
          clPo: tempPo.clPo,
          clPoRev: tempPo.clPoRev,
          clPoItem: tempPo.clPoItem,
          clCode: tempPo.clCode
        };
      } else {
          poQuery = {};
      }

      if (_.isEmpty(poQuery)) {
        resolve({
          row: row,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Fields ("clPo", "clPoRev", "clPoItem", "clCode") or ("vlSo", "vlSoItem") should not be empty.'
        });
      } else if (tempPo.hasOwnProperty('projectNr') && tempPo.projectNr != projectNr) {
        resolve({
          row: row,
          isRejected: true,
          isEdited: false,
          isAdded: false,
          reason: 'Field projectNr does not match current project number.'
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
            //assign poId and Split Qty
            tempSub.poId = resNewPo.value._id;
            tempSub.splitQty = resNewPo.value.qty;
            tempSub.projectId = resNewPo.value.projectId; //------------new projectId
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




