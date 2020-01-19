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

router.post('/', upload.single('file'), function (req, res) {
  const projectId = req.body.projectId;
  const file = req.file
  if (!projectId || !file) {
    res.status(400).json({message: 'file or projectId missing'});
  } else {
    FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
    .populate('fields')
    .sort({forShow:'asc'})
    .exec(function (errFieldNames, resFieldNames) {
      if (errFieldNames || !resFieldNames) {
        return res.status(400).json({message: 'an error occured'});
      } else {
        //Does the object already exist, search by PO_VLB and PO_VLB_Item?
        //Does the object already exist, search by COO, Rev, ClientCode and Item

        var workbook = new Excel.Workbook();
        workbook.xlsx.load(file.buffer).then(wb => {
          var worksheet = wb.getWorksheet(1);
          const rowCount = worksheet.rowCount;
          if (rowCount < 2) {
            return res.status(400).json({message: 'the Duf File appears to be empty'});
          } else {
            for (let i=2; i < worksheet.rowCount + 1; i++) {
              const tempPo = new Object();
              const tempSub = new Object();
              resFieldNames.map(resFieldName => {
                switch (resFieldName.fields.fromTbl) {
                  case 'po':
                    tempPo[resFieldName.fields.name] = worksheet.getCell(`${alphabet(resFieldName.forShow) + i}`).value;
                    break;
                  case 'sub':
                    tempSub[resFieldName.fields.name] = worksheet.getCell(`${alphabet(resFieldName.forShow) + i}`).value;
                    break;
                  default: console.log('not in table Po or Table Sub')
                }
              });
              console.log('tempPo', tempPo);
              console.log('tempSub', tempSub);
            }
          }
        });
      }
    })
  }

  // function testIdt(vlSo, vlSoItem, clPo, clPoRev, clPoItem, clCode) {
  //   return new Promise (function (respolve, reject) {
  //     if ( (vlSo== '' || vlSoItem == 0) && ({

  //     }
  //   })
  // }


  function testLength(row, col, key, value) {
    return new Promise (function (respolve, reject) {
      switch (key) {
        case 'rev':
        case 'size':
        case 'sch':
        case 'qty':
          if (value.ToString().Length > 25){
            reject(`rejected line: ${row}, col ${col} Value exceeds maxium length: ${value}`);
          } else {
            resolve();
          } 
          break;
        case 'kind':
            if (value.ToString().Length > 15){
              reject(`rejected line: ${row}, col ${col} Value exceeds maxium length: ${value}`);
            } else {
              resolve();
            } 
            break;
        case 'manufacturer':
        case 'manufOrigin':
        case 'destination':
            if (value.ToString().Length > 15){
              reject(`rejected line: ${row}, col ${col} Value exceeds maxium length: ${value}`);
            } else {
              resolve();
            } 
            break;
        default: resolve();
      }
    });
  }


    // FieldName.find({ screenId: '5cd2b646fd333616dc360b6d', projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
    // .populate('fields')
    // .sort({forShow:'asc'})
    // .exec(function (errFieldNames, resFieldNames) {
    //     if (errFieldNames) {
    //         return res.status(400).json({message: errFieldNames})
    //     } else if (!resFieldNames) {
    //         return res.status(400).json({message: 'an error occured'});
    //     } else {
    //         workbook = new Excel.Workbook();
    //         workbook.properties.date1904 = true;
    //         var worksheet = workbook.addWorksheet('My Sheet');
    //         if (!!resFieldNames.length) {
    //             resFieldNames.map(resFieldName => {
    //                 if(resFieldName.forShow > 0) {
    //                     let cell = worksheet.getCell(`${alphabet(resFieldName.forShow) + 1}`);
    //                     with (cell) {
    //                         value = resFieldName.fields.custom,
    //                         style = Object.create(cell.style), //shallow-clone the style, break references
    //                         border ={
    //                             top: {style:'thin'},
    //                             left: {style:'thin'},
    //                             bottom: {style:'thick'},
    //                             right: {style:'thin'}                
    //                         },
    //                         fill = {
    //                             type: 'pattern',
    //                             pattern: 'solid',
    //                             fgColor:{argb:'FFFFFFCC'}
    //                         },
    //                         font = {
    //                             name: 'Calibri',
    //                             family: 2,
    //                             size: 11,
    //                             bold: true
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //         workbook.xlsx.write(res);
    //     }
    // });
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