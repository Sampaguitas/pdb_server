var express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
var Excel = require('exceljs');
fs = require('fs');
const _ = require('lodash');

router.post('/', function (req, res) {
    
    const screenId = req.query.screenId;
    const projectId = req.query.projectId;
    const unlocked = req.query.unlocked;
    const selectedIds = req.body.selectedIds;
    
    let poIds = [];
    let subIds = [];
    let returnIds = [];
    let heatIds = [];
    let certificateIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
        element.returnId && !returnIds.includes(element.returnId) && returnIds.push(element.returnId);
        element.heatId && !heatIds.includes(element.heatId) && heatIds.push(element.heatId);
        element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
    });

    console.log(heatIds);

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
          populate: [
            {
              path: 'subs',
              match: { _id: { $in: subIds} },
              populate: {
                path: 'heats',
                match: { _id: { $in: heatIds} },
                populate: {
                  path: 'certificate'
                }
              }
            },
            {
              path: 'returns',
              match: { _id: { $in: returnIds} },
              populate: {
                path: 'heats',
                match: { _id: { $in: heatIds} },
                populate: {
                  path: 'certificate'
                }
              }
            },
          ]
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
            worksheet.getRow(1).height = 30;
            myHeaders.map(function (header) {
              let cell = worksheet.getCell(`${alphabet(header.col)}1`);
              myFgColour = header.col < 6 ? { argb: 'A8052C'} : { argb: '0070C0'}
              with (cell) {
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
                  fgColor: myFgColour
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
              worksheet.getRow(indexLine + 3).height = 25;
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 3)}`);
                
                let myColour = function () {
                  if (myCell.col < 6) {
                    return {argb: 'd3d3d3'};
                  } else if (unlocked == 'false' && myCell.edit) {
                    return {argb: 'd3d3d3'};
                  } else {
                    return {argb: 'FFFFFF'};
                  }
                }

                let myProtection = function () {
                  if (myCell.col < 6) {
                    return { locked: true };
                  } else if (unlocked == 'false' && myCell.edit) {
                    return { locked: true };
                  } else {
                    return { locked: false }
                  }
                }
                
                with (cell) {
                  style = Object.create(cell.style), //shallow-clone the style, break references
                  border ={
                    top: {style:'hair'},
                    left: {style:'hair'},
                    bottom: {style:'hair'},
                    right: {style:'hair'}                
                  },
                  fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: myColour()
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
                  protection = myProtection(),
                  value = myCell.val         
                }
              });
            });
          }

          //add autofilter in row 2
          worksheet.autoFilter = `A2:${alphabet(resProject.fieldnames.length + 5)}2`;

          //hide Ids
          worksheet.getColumn('A').hidden = true; //poId
          worksheet.getColumn('B').hidden = true; //subId
          worksheet.getColumn('C').hidden = true; //returnId
          worksheet.getColumn('D').hidden = true; //heatId
          worksheet.getColumn('E').hidden = true; //certificateId
          
          //set worksheet protection options
          let options = {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: true,
            formatColumns: true,
            formatRows: true,
            insertRows: false,
            insertColumns: false,
            insertHyperlinks: false,
            deleteRows: false,
            deleteColumns: false,
            sort: true,
            autoFilter: true,
            pivotTables: true
          }

          //protect worksheet 
          await worksheet.protect('', options);
          
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
        val: 'RET ID',
        col: 3,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'HEAT ID',
        col: 4,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'CERT ID',
        col: 5,
        type: 'String',
        align: 'left'
      });
      fieldnames.map( function (fieldname, index) {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 6,
          type: 'String',
          align: fieldname.align       
        });
      });
    return arr;
  }

function getLines (resProject, fieldnames, screenId) {
    let arrayBody = [];
    let arrayRow = [];
        if (resProject.pos) {
          resProject.pos.map(po => {
            if (po.subs) {
              po.subs.map(sub => {
                virtuals(sub.heats).map(virtual => {
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
                    val: '', //returnId
                    col: 3,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: virtual.heatId, //returnId
                    col: 4,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: virtual.certificateId, //returnId
                    col: 5,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  fieldnames.map( (fieldname, index) => {
                    switch(fieldname.fields.fromTbl) {
                      case 'po':
                        if (['project', 'projectNr'].includes(fieldname.fields.name)) {
                          arrayRow.push({
                            val: fieldname.fields.name === 'project' ? getValue('name', resProject) || '' : getValue('number', resProject) || '',
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, po),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        }
                        break;
                      case 'sub':
                        if (fieldname.fields.name === 'shippedQty') {
                          arrayRow.push({
                            val: '',
                            col: index + 6,
                            type: "String",
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else if (fieldname.fields.name === 'heatNr') {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, virtual),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, sub),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        }
                        break;
                      case 'certificate':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, virtual),
                          col: index + 6,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit,
                        });
                        break;
                      default: arrayRow.push({
                        val: '',
                        col: index + 6,
                        type: "String",
                        align: 'left',
                        edit: fieldname.edit,
                      });
                    }
                  });
                  arrayBody.push(arrayRow);
                });
              });
            }
            if (po.returns) {
              po.returns.map(_return => {
                virtuals(_return.heats).map(virtual => {
                  arrayRow = [];
                  arrayRow.push({
                    val: po._id, //poId
                    col: 1,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: '', //subId
                    col: 2,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: _return._id, //returnId
                    col: 3,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: virtual.heatId, //returnId
                    col: 4,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: virtual.certificateId, //returnId
                    col: 5,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  fieldnames.map( (fieldname, index) => {
                    switch(fieldname.fields.fromTbl) {
                      case 'po':
                        if (['project', 'projectNr'].includes(fieldname.fields.name)) {
                          arrayRow.push({
                            val: fieldname.fields.name === 'project' ? getValue('name', resProject) || '' : getValue('number', resProject) || '',
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, po),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        }
                        break;
                      case 'sub':
                        if (fieldname.fields.name === 'shippedQty') {
                          arrayRow.push({
                            val: '',
                            col: index + 6,
                            type: "String",
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else if (fieldname.fields.name === 'heatNr') {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, virtual),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, sub),
                            col: index + 6,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit,
                          });
                        }
                        break;
                      case 'certificate':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, virtual),
                          col: index + 6,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit,
                        });
                      default: arrayRow.push({
                        val: '',
                        col: index + 6,
                        type: "String",
                        align: fieldname.align,
                        edit: fieldname.edit,
                      });
                    }
                  });
                  arrayBody.push(arrayRow);
                });
              });
            }
          });
        }
    return arrayBody;
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


function virtuals(heats) {
  let tempVirtuals = [];
  
  if (!_.isEmpty(heats)) {
      tempVirtuals = heats.reduce(function(acc, cur) {
          acc.push({
              cif: cur.certificate.cif,
              heatNr: cur.heatNr,
              inspQty: cur.inspQty,
              heatId: cur._id,
              certificateId: cur.certificateId
          });
          return acc;
      }, []);
  }

  if (!_.isEmpty(tempVirtuals)) {
      return tempVirtuals;
  } else {
      return ([
          {
              cif: '',
              heatNr: '',
              inspQty: '',
              heatId: '',
              certificateId: '',
          }
      ]);
  }
}