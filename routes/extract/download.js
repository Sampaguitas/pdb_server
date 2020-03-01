var express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
var Excel = require('exceljs');
fs = require('fs');
const _ = require('lodash');

  //expediting: poId and subId
  //inspection,  release data: poId, subId, _id (from certificate)
  //inspection, certificates: poId, subId, _id (from certificate)
  //shipping, transport docs: poId, subId, _id (from packItem) , packId (from colliPack)
  //shipping, packing details: _id (from colliPack)

  //screenId: '5cd2b642fd333616dc360b63', //Expediting
  //screenId: '5cd2b642fd333616dc360b64', //Inspection
  //screenId: '5cd2b642fd333616dc360b65', //Certificates
  //screenId: '5cd2b643fd333616dc360b67', //packing details
  //

router.post('/', function (req, res) {
    
    const screenId = req.query.screenId;
    const projectId = req.query.projectId;
    const unlocked = req.query.unlocked;
    const selectedIds = req.body.selectedIds;
    

    let poIds = [];
    let subIds = [];
    let certificateIds = [];
    let packItemIds = [];
    let colliPackIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
        element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
        element.packItemId && !packItemIds.includes(element.packItemId) && packItemIds.push(element.packItemId);
        element.colliPackId && !colliPackIds.includes(element.colliPackId) && colliPackIds.push(element.colliPackId);
    });

    if (!screenId || !projectId) {
      res.status(400).json({
          message: 'screenId or projectId is missing'
      });
    } else {
      Project.findById(projectId)
      .populate([
        {
            path: 'fieldnames',
            match: {
                screenId: screenId,
                projectId: projectId,
                forShow: { $exists: true, $nin: ['', 0] }
            },
            options: { sort: { forShow:'asc' } },
            populate: { path: 'fields' }
        },
        {
          path: 'pos',
          match: { _id: { $in: poIds} },
          options: { sort: { clPo: 'asc', clPoRev: 'asc', clPoItem: 'asc' } },
          populate: {
            path: 'subs',
            match: { _id: { $in: subIds} },
            populate: {
              path: 'packitems',
              match: { _id: { $in: packItemIds} },
              options: { sort: {  'plNr': 'asc', 'colliNr': 'asc' } }
            }
          }
        },
        {
          path: 'collipacks',
          match: { _id: { $in: colliPackIds} }
        },
        {
          path: 'certificates',
          match: { _id: { $in: subIds} }
        }
      ])
      .exec(async function(errProject, resProject) {
        if (errProject) {
          res.status(400).json({ message: 'An error has occured.' });
        } else if (_.isEmpty(resProject)) {
          res.status(400).json({ message: 'Could not retrive project information.' });
        } else if (_.isEmpty(resProject.fieldnames)) {
          res.status(400).json({ message: 'Could not retrive the screen fields.' });
        } else {
          var workbook = new Excel.Workbook();
          var worksheet = workbook.addWorksheet('My Sheet');
          
          //add headers
          let myHeaders = getHeaders(resProject.fieldnames);
          if (!_.isEmpty(myHeaders)) {
            myHeaders.map(function (header) {
              let cell = worksheet.getCell(`${alphabet(header.col) + 1}`);
              with (cell) {
                style = Object.create(cell.style), //shallow-clone the style, break references
                border ={
                  top: {style:'thin'},
                  left: {style:'thin'},
                  bottom: {style:'thick'},
                  right: {style:'thin'}                
                },
                fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor:{ argb: '0070C0'}
                },
                font = {
                  name: 'Calibri',
                  color: { argb: 'FFFFFF'},
                  family: 2,
                  size: 11,
                  bold: false
                },
                alignment = {
                  vertical: 'middle',
                  horizontal: header.align
                }
                value = header.val         
              }
            });
          }

          //add lines
          let myLines = getLines(resProject, resProject.fieldnames, screenId);
          if (!_.isEmpty(myLines)) {
            myLines.map(function (line, indexLine) {
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 2)}`);
                let myColour = (!unlocked && myCell.edit) ? {argb: 'd3d3d3'} : {argb: 'FFFFFF'};
                let myProtection = { locked: false } //(!unlocked && myCell.edit) ? { locked: true } : { locked: false };
                with (cell) {
                  style = Object.create(cell.style), //shallow-clone the style, break references
                  border ={
                    top: {style:'thin'},
                    left: {style:'thin'},
                    bottom: {style:'thin'},
                    right: {style:'thin'}                
                  },
                  fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: myColour
                  },
                  font = {
                    name: 'Calibri',
                    family: 2,
                    size: 11,
                    bold: false
                  },
                  alignment = {
                    vertical: 'middle',
                    horizontal: myCell.align
                  },
                  // protection = myProtection,
                  value = myCell.val         
                }
              });
            });
          }

          //add autofilter in row 2
          // worksheet.autoFilter = `"A1:${alphabet(resProject.fieldnames.length + 4)}1"`;
          // console.log(`"A1:${alphabet(resProject.fieldnames.length + 4)}1"`);

          worksheet.autoFilter = 'A1:BD1';
          // if (!_.isEmpty(myLines)) {
          //   worksheet.autoFilter = `"A1:${alphabet(resProject.fieldnames.length + 4) + (myLines.length + 1)}"`;
          //   console.log(`"A1:${alphabet(resProject.fieldnames.length + 4) + (myLines.length + 1)}"`);
          // } else {
          //   worksheet.autoFilter = `"A1:${alphabet(resProject.fieldnames.length + 4)}1"`;
          //   console.log(`"A1:${alphabet(resProject.fieldnames.length + 4)}1"`);
          // }
          

          //hide Ids
          // worksheet.getColumn('A').hidden = true; //poId
          // worksheet.getColumn('B').hidden = true; //subId
          // worksheet.getColumn('C').hidden = true; //packitemId
          // worksheet.getColumn('D').hidden = true; //collipackId
          
          //set worksheet protection options
          // let options = {
          //   selectLockedCells: true,
          //   selectUnlockedCells: true,
          //   formatCells: true,
          //   formatColumns: true,
          //   formatRows: true,
          //   insertRows: false,
          //   insertColumns: false,
          //   insertHyperlinks: false,
          //   deleteRows: false,
          //   deleteColumns: false,
          //   sort: true,
          //   autoFilter: true,
          //   pivotTables: true
          // }

          //protect worksheet 
          // await worksheet.protect('', options);
          
          workbook.xlsx.write(res);
        }
      });
    }
});

function getHeaders(fieldnames) {
    const arr = [];
      arr.push({
        val: 'PO ID',
        col: 1,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'SUB ID',
        col: 2,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'PackItem ID',
        col: 3,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'ColliPack ID',
        col: 4,
        type: 'String',
        align: 'left'
      });
      fieldnames.map( (fieldname, index) => {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 5,
          type: 'String',
          align: fieldname.align       
        });
      });
    return arr;
  }

function getLines (resProject, fieldnames, screenId) {
    let arrayBody = [];
    let arrayRow = [];
    switch(screenId) {
      case '5cd2b642fd333616dc360b63': //Expediting
      case '5cd2b642fd333616dc360b64': //Inspection
      case '5cd2b643fd333616dc360b67': //packing details
        if (resProject.pos) {
          resProject.pos.map(po => {
            if (po.subs) {
              po.subs.map(sub => {
                if (!_.isEmpty(sub.packitems)) {
                  sub.packitems.map(packitem => {
                    arrayRow = [];
                    arrayRow.push({
                      val: po._id, //poId
                      col: 1,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: sub._id, //subId
                      col: 2,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: packitem._id, //packItemId
                      col: 3,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: '', //colliPackId
                      col: 4,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    fieldnames.map( (fieldname, index) => {
                      switch(fieldname.fields.fromTbl) {
                        case 'po':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, po),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                        case 'sub':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, sub),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                        case 'packitem':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, packitem),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                        default: arrayRow.push({
                          val: '',
                          col: index + 5,
                          type: 'String',
                          align: 'left',
                          edit: true
                        });
                      }
                    });
                    arrayBody.push(arrayRow);
                  });
                } else {
                  arrayRow = [];
                  arrayRow.push({
                    val: po._id, //poId
                    col: 1,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: sub._id, //subId
                    col: 2,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: '', //packItemId
                    col: 3,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: '', //colliPackId
                    col: 4,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  fieldnames.map( (fieldname, index) => {
                    switch(fieldname.fields.fromTbl) {
                      case 'po':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, po),
                          col: index + 5,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                        break;
                      case 'sub':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, sub),
                          col: index + 5,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                        break;
                      default: arrayRow.push({
                        val: '',
                        col: index + 5,
                        type: "String",
                        align: 'left',
                        edit: true
                      });
                    }
                  });
                  arrayBody.push(arrayRow);
                }
              });
            }
          });
        }
        break;
      case '5cd2b642fd333616dc360b65': //Certificates
      case '5cd2b643fd333616dc360b67': //Print Transport Documents
    }
    
    return arrayBody;
}

function getScreenTbls (fieldnames) {
  return fieldnames.reduce(function (acc, curr) {
      if(!acc.includes(curr.fields.fromTbl)) {
          acc.push(curr.fields.fromTbl)
      }
      return acc;
  },[]);
}

function getValue(key, object) {

  let nonPrintable = /[\t\r\n]/mg;

  if (_.isUndefined(key) || _.isUndefined(object[key])) {
    return '';
  } else if (nonPrintable.test(object[key])) {
    return object[key].replace(nonPrintable, '');
  } else {
    return object[key]
  } 
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