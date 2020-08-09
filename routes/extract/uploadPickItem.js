var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
fs = require('fs');
const FieldName = require('../../models/FieldName');
const PickTicket = require('../../models/PickTicket');
const PickItem = require('../../models/PickItem');
const MirItem = require('../../models/MirItem');
const Po = require('../../models/Po');
const Mir = require('../../models/Mir');
var Excel = require('exceljs');
var _ = require('lodash');

router.post('/', upload.single('file'), function (req, res) {
    
    const screenId = req.body.screenId;
    const projectId = req.body.projectId;
    const file = req.file;
    
    let colPromises = [];
    let rowPromises = [];

    let tempPickticket = {};
    let tempPickitem = {};
    let tempMiritem = {};
    let tempPo = {};
    let tempMir = {};

    let rejections = [];
    let nProcessed = 0;
    let nRejected = 0;
    let nEdited = 0;
  
  if (!screenId || !projectId || !file) {
    res.status(400).json({
      message: 'file, screenId or projectId is missing',
      rejections: rejections,
      nProcessed: nProcessed,
      nRejected: nRejected,
      nEdited: nEdited
    });
  } else {
    FieldName.find({ screenId: screenId, projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} }) //edited
    .populate('fields')
    .sort({forShow:'asc'})
    .exec(function (errFieldNames, resFieldNames) {
      if (errFieldNames || !resFieldNames) {
        return res.status(400).json({
            message: 'an error has occured',
            rejections: rejections,
            nProcessed: nProcessed,
            nRejected: nRejected,
            nEdited: nEdited
        });
      } else {
        var workbook = new Excel.Workbook();
        workbook.xlsx.load(file.buffer).then(wb => { //edited
          
          var worksheet = wb.getWorksheet(1);
          worksheet.unprotect();
          let rowCount = worksheet.rowCount;
          
          if (rowCount < 3) { //2
            return res.status(400).json({
              message: 'the File seams to be empty',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nEdited: nEdited
            });
          } else if (rowCount > 800) {
            return res.status(400).json({
              message: 'try to upload less rows than 800 rows at the time',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nEdited: nEdited
            });
          } else {
 
            (async function() {
              for (let row = 3; row < rowCount + 1 ; row++) { //2

                colPromises = [];

                //initialise objects
                for (var member in tempPickticket) delete tempPickticket[member];
                for (var member in tempPickitem) delete tempPickitem[member];
                for (var member in tempMiritem) delete tempMiritem[member];
                for (var member in tempPo) delete tempPo[member];
                for (var member in tempMir) delete tempMir[member];
                
                //assign PickTicket Ids
                tempPickticket._id = clean(worksheet.getCell('A' + row).value);
                //assign PickItem Ids
                tempPickitem._id = clean(worksheet.getCell('B' + row).value);
                //assign Miritem Ids
                tempMiritem._id = clean(worksheet.getCell('C' + row).value);
                //assign Po Ids
                tempPo._id = clean(worksheet.getCell('D' + row).value);
                //assign Mir Ids
                tempMir._id = clean(worksheet.getCell('E' + row).value);

                resFieldNames.map((resFieldName, index) => {
                  let cell = alphabet(index + 6) + row;
                  let fromTbl = resFieldName.fields.fromTbl;
                  let type = resFieldName.fields.type;
                  let key = resFieldName.fields.name;
                  let value = clean(worksheet.getCell(cell).value);
                  
                  colPromises.push(testFormat(row, cell, type, value));
                  
                  switch (fromTbl) {
                    case 'pickticket':
                      if (key != 'pickStatus') {
                        tempPickticket[key] = value
                      }
                      break;
                    case 'pickitem':
                      tempPickitem[key] = value
                      break;
                    case 'miritem':
                      tempMiritem[key] = value
                      break;
                    case 'po':
                      tempPo[key] = value
                      break;
                    case 'mir':
                      tempMir[key] = value;
                      break;
                  }
                });// end map

                await Promise.all(colPromises).then( async () => {
                  rowPromises.push(update(row, tempPickticket, tempPickitem, tempMiritem, tempPo, tempMir));
                }).catch(errPromises => {
                  rejections.push(errPromises)
                  nRejected++;
                });//end colPromises.all promise

                nProcessed++;
              } //end for loop

              await Promise.all(rowPromises).then(resRowPromises => {
                resRowPromises.map(r => {
                  if (r.isRejected) {
                    rejections.push({row: r.row, reason: r.reason});
                    nRejected++;
                  } else {
                    nEdited++;
                  }
                });//end parse resRowPromise
                return res.status(200).json({
                  rejections: rejections,
                  nProcessed: nProcessed,
                  nRejected: nRejected,
                  nEdited: nEdited
                });
              }).catch( () => {
                return res.status(400).json({
                  message: 'An error has occured during the upload.',
                  rejections: rejections,
                  nProcessed: nProcessed,
                  nRejected: nRejected,
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
              nEdited: nEdited
          });
        });//end wb load promise
      }
    })
  }

  function update(row, tempPickticket, tempPickitem, tempMiritem, tempPo, tempMir) {
    return new Promise (function (resolve) {
      PickTicket.findByIdAndUpdate(tempPickticket._id, tempPickticket, function(errNewPickticket, resNewPickticket){
          if (errNewPickticket || !resNewPickticket) {
            resolve({
              row: row,
              isRejected: true,
              isEdited: false,
              isAdded: false,
              reason: 'Fields from Table Pickticket could not be saved.'
            });
          } else {
            PickItem.findByIdAndUpdate(tempPickitem._id, tempPickitem, function(errNewPickitem, resNewPickitem){
              if (errNewPickitem || !resNewPickitem) {
                resolve({
                  row: row,
                  isRejected: true,
                  isEdited: false,
                  isAdded: false,
                  reason: 'Fields from Table PickItem could not be saved.'
                });
              } else {
                MirItem.findByIdAndUpdate(tempMiritem._id, tempMiritem, function(errNewMiritem, resNewMiritem){
                  if (errNewMiritem || !resNewMiritem) {
                    resolve({
                      row: row,
                      isRejected: true,
                      isEdited: false,
                      isAdded: false,
                      reason: 'Fields from Table MirItem could not be saved.'
                    });
                  } else {
                    Po.findByIdAndUpdate(tempPo._id, tempPo, function(errNewPo, resNewPo){
                      if (errNewPo || !resNewPo) {
                        resolve({
                          row: row,
                          isRejected: true,
                          isEdited: false,
                          isAdded: false,
                          reason: 'Fields from Table Po could not be saved.'
                        });
                      } else {
                        Mir.findByIdAndUpdate(tempMir._id, tempMir, function(errNewMir, resNewMir){
                          if (errNewMir || !resNewMir) {
                            resolve({
                              row: row,
                              isRejected: true,
                              isEdited: false,
                              isAdded: false,
                              reason: 'Fields from Table Mir could not be saved.'
                            });
                          } else {
                            resolve({
                              row: row,
                              isRejected: false,
                              isEdited: true,
                              isAdded: false,
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
    });
  }
});

function testFormat(row, cell, type, value) {
  return new Promise(function (resolve, reject) {
    switch (type){
      case 'Number':
        if (!_.isEmpty(value) && !_.isNull(value) && !_.isUndefined(value) && !_.isNumber(value)) {
          reject({row: row, reason: `Cell: ${cell} is not a Number.`});
        } else {
          resolve();
        }
      break;
      case 'Date':
        if(!_.isEmpty(value) && !_.isNull(value) && !_.isUndefined(value) && !_.isDate(value)) {
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

function clean(value) {
  let nonPrintable = /[\t\r\n]/mg;
  let DbQuotes = /^".*"$/
  let sQuote = /^[`|'].*$/
  
  if (nonPrintable.test(value)) {
    value = value.replace(nonPrintable, '');
  }
  
  if(DbQuotes.test(value)){
    return value.slice(1,-1);
  } else if (sQuote.test(value)) {
    return value.substr(1)
  } else {
    return value
  }
}

module.exports = router;




