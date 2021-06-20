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
    const locale = req.query.locale || "en-US";
    const selectedIds = req.body.selectedIds;
    
    
    let poIds = [];
    let subIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
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
            populate: [
              {
                path: 'packitems'
              },
              {
                path: 'heats',
                options: { sort: { heatNr: 'asc' } },
                populate: {
                  path: 'certificate'
                }
              }
            ]
          }
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
              myFgColour = header.col < 3 ? { argb: 'A8052C'} : { argb: '0070C0'}
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
          let myLines = getLines(resProject, resProject.fieldnames, screenId, locale);
          if (!_.isEmpty(myLines)) {
            myLines.map(function (line, indexLine) {
              worksheet.getRow(indexLine + 3).height = 25;
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 3)}`);
                
                let myColour = function () {
                  if (myCell.col < 3) {
                    return {argb: 'd3d3d3'};
                  } else if (unlocked == 'false' && myCell.edit) {
                    return {argb: 'd3d3d3'};
                  } else {
                    return {argb: 'FFFFFF'};
                  }
                }

                let myProtection = function () {
                  if (myCell.col < 3) {
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
          worksheet.autoFilter = `A2:${alphabet(resProject.fieldnames.length + 2)}2`;

          //hide Ids
          worksheet.getColumn('A').hidden = true; //poId
          worksheet.getColumn('B').hidden = true; //subId
          
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
      fieldnames.map( function (fieldname, index) {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 3,
          type: 'String',
          align: fieldname.align
        });
      });
    return arr;
  }

function getLines (resProject, fieldnames, screenId, locale) {
    let arrayBody = [];
    let arrayRow = [];
    let hasPackitems = getScreenTbls(fieldnames, screenId).includes('packitem');
        if (resProject.pos) {
          resProject.pos.map(po => {
            if (po.subs) {
              po.subs.map(sub => {
                let certificate = sub.heats.reduce(function (acc, cur) {
                  if (!acc.heatNr.split(' | ').includes(cur.heatNr)) {
                      acc.heatNr = !acc.heatNr ? cur.heatNr : `${acc.heatNr} | ${cur.heatNr}`
                  }
                  if (!acc.cif.split(' | ').includes(cur.certificate.cif)) {
                      acc.cif = !acc.cif ? cur.certificate.cif : `${acc.cif} | ${cur.certificate.cif}`
                  }
                  if (!acc.inspQty.split(' | ').includes(String(cur.inspQty))) {
                      acc.inspQty = !acc.inspQty ? String(cur.inspQty) : `${acc.inspQty} | ${String(cur.inspQty)}`
                  }
                  return acc;
                }, {
                    heatNr: '',
                    cif: '',
                    inspQty: ''
                });
                if (!_.isEmpty(sub.packitems) && hasPackitems) {
                  virtuals(sub.packitems, po.uom, getTblFields(fieldnames, 'packitem'), locale).map(virtual => {
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
                    fieldnames.map( (fieldname, index) => {
                      switch(fieldname.fields.fromTbl) {
                        case 'po':
                          if (['project', 'projectNr'].includes(fieldname.fields.name)) {
                            arrayRow.push({
                              val: fieldname.fields.name === 'project' ? getValue('name', resProject) || '' : getValue('number', resProject) || '',
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, po),
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          }
                          break;
                        case 'sub':
                          if (fieldname.fields.name === 'heatNr') {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, certificate),
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else if (fieldname.fields.name === 'shippedQty') {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, virtual),
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else if (fieldname.fields.name === 'relQty' && !resProject.enableInspection) {
                            arrayRow.push({
                              val: getValue('splitQty', sub),
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, sub),
                              col: index + 3,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          }
                          break;
                          case 'certificate':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, certificate),
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                          case 'packitem':
                            if (fieldname.fields.name === 'plNr') {
                              arrayRow.push({
                                val: getValue(fieldname.fields.name, virtual),
                                col: index + 3,
                                type: fieldname.fields.type,
                                align: fieldname.align,
                                edit: fieldname.edit
                              });
                            } else {
                              arrayRow.push({
                                val: virtual[screenHeader.fields.name].join(' | '),
                                col: index + 3,
                                type: "String",
                                align: fieldname.align,
                                edit: fieldname.edit
                              });
                            }
                            break;
                        default: arrayRow.push({
                          val: '',
                          col: index + 3,
                          type: "String",
                          align: fieldname.align,
                          edit: fieldname.edit
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
                  fieldnames.map( (fieldname, index) => {
                    switch(fieldname.fields.fromTbl) {
                      case 'po':
                        if (['project', 'projectNr'].includes(fieldname.fields.name)) {
                          arrayRow.push({
                            val: fieldname.fields.name === 'project' ? getValue('name', resProject) || '' : getValue('number', resProject) || '',
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, po),
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        }
                        break;
                      case 'sub':
                        if (fieldname.fields.name === 'heatNr') {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, certificate),
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else if (fieldname.fields.name === 'shippedQty') {
                          arrayRow.push({
                            val: '',
                            col: index + 3,
                            type: "String",
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else if (fieldname.fields.name === 'relQty' && !resProject.enableInspection) {
                          arrayRow.push({
                            val: getValue('splitQty', sub),
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, sub),
                            col: index + 3,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        }
                        break;
                      case 'certificate':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, certificate),
                          col: index + 3,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                        break;
                      default: arrayRow.push({
                        val: '',
                        col: index + 3,
                        type: "String",
                        align: fieldname.align,
                        edit: fieldname.edit
                      });
                    }
                  });
                  arrayBody.push(arrayRow);
                }
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

  function getScreenTbls (fieldnames, screenId) {
    return fieldnames.reduce(function(acc, cur) {
      if (String(cur.screenId) === screenId && !!cur.fields && !acc.includes(cur.fields.fromTbl)) {
        acc.push(cur.fields.fromTbl);
      }
      return acc;
    }, []);
  }

  // function getScreenTbls (fieldnames, screenId) {
  //   if (!_.isUndefined(fieldnames) && fieldnames.hasOwnProperty('items') && !_.isEmpty(fieldnames.items)) {
  //       return fieldnames.items.reduce(function (acc, cur) {
  //           if(!acc.includes(cur.fields.fromTbl) && cur.screenId === screenId) {
  //               acc.push(cur.fields.fromTbl)
  //           }
  //           return acc;
  //       },[]);
  //   } else {
  //       return [];
  //   }
  // }

  function getTblFields (fieldnames, fromTbl) {
    if (fieldnames) {
        let tempArray = [];
        fieldnames.reduce(function (acc, cur) {
            if (cur.fields.fromTbl === fromTbl && !acc.includes(cur.fields._id)) {
                tempArray.push(cur.fields);
                acc.push(cur.fields._id);
            }
            return acc;
        },[]);
        return tempArray;
    } else {
        return [];
    }
  }

  function hasPackingList(packItemFields) {
    let tempResult = false;
    if (packItemFields) {
        packItemFields.map(function (packItemField) {
            if (packItemField.name === 'plNr') {
                tempResult = true;
            }
        });
    }
    return tempResult;
  }

  function getDateFormat(locale) {
  
    const options = {'year': 'numeric', 'month': '2-digit', day: '2-digit', timeZone: 'GMT'};
    let tempDateFormat = '';
  
    Intl.DateTimeFormat(locale, options).formatToParts().map(function (element) {
        switch(element.type) {
            case 'month': 
                tempDateFormat = tempDateFormat + 'MM';
                break;
            case 'literal': 
                tempDateFormat = tempDateFormat + element.value;
                break;
            case 'day': 
                tempDateFormat = tempDateFormat + 'DD';
                break;
            case 'year': 
                tempDateFormat = tempDateFormat + 'YYYY';
                break;
        }
    });
    return tempDateFormat;
  }
  
  function TypeToString(fieldValue, fieldType, locale) {
    if (fieldValue) {
        switch (fieldType) {
            case 'Date': return String(moment.utc(fieldValue).format(getDateFormat(locale)));
            case 'Number': return String(new Intl.NumberFormat(locale).format(fieldValue)); 
            default: return fieldValue;
        }
    } else {
        return '';
    }
  }

  function virtuals(packitems, uom, packItemFields, locale) {
    let tempVirtuals = [];
    let tempUom = ['M', 'MT', 'MTR', 'MTRS', 'F', 'FT', 'FEET', 'LM'].includes(uom.toUpperCase()) ? 'mtrs' : 'pcs';
    if (hasPackingList(packItemFields)) {
      packitems.reduce(function (acc, cur){
          if (cur.plNr){
              if (!acc.includes(cur.plNr)) {
  
                  let tempObject = {};
                  tempObject['shippedQty'] = cur[tempUom];
                  packItemFields.map(function (packItemField) {
                      if (packItemField.name === 'plNr') {
                          tempObject['plNr'] = cur['plNr'];
                          tempObject['_id'] = cur['plNr'];
                      } else {
                          tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)]
                      }               
                  });
                  tempVirtuals.push(tempObject);
                  acc.push(cur.plNr);
                  
              } else if (acc.includes(cur.plNr)) {
      
                  let tempVirtual = tempVirtuals.find(element => element.plNr === cur.plNr);            
                  tempVirtual['shippedQty'] += cur[tempUom];
                  packItemFields.map(function (packItemField) {
                      if (packItemField.name != 'plNr' && !tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                          tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                      }               
                  });
                  // acc.push(cur.plNr);
              }
            } else if (!acc.includes('0')) {
              let tempObject = {_id: '0'}
              tempObject['shippedQty'] = '';
              packItemFields.map(function (packItemField) {
                if (packItemField.name === 'plNr') {
                    tempObject['plNr'] = ''
                } else {
                    tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
                }
              });
              tempVirtuals.push(tempObject);
              acc.push('0');
            } else {
              let tempVirtual = tempVirtuals.find(element => element._id === '0');
              packItemFields.map(function (packItemField) {
                  if (packItemField.name != 'plNr' && !tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                      tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                  }               
              });
            }
          return acc;
      }, []);
    } else {
      packitems.reduce(function(acc, cur) {
        if (cur.plNr){
            if (!acc.includes('1')) {
                let tempObject = {_id: '1'}
                tempObject['shippedQty'] = cur[tempUom];
                packItemFields.map(function (packItemField) {
                    tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
                });
                tempVirtuals.push(tempObject);
                acc.push('1');
            } else {
                let tempVirtual = tempVirtuals.find(element => element._id === '1');
                tempVirtual['shippedQty'] += cur[tempUom];
                packItemFields.map(function (packItemField) {
                    if (!tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                        tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                    }
                });
            }
        } else {
            if (!acc.includes('0')) {
                let tempObject = {_id: '0'}
                packItemFields.map(function (packItemField) {
                    tempObject[packItemField.name] = [TypeToString(cur[packItemField.name], packItemField.type, locale)];
                });
                tempVirtuals.push(tempObject);
                acc.push('0');
            } else {
                let tempVirtual = tempVirtuals.find(element => element._id === '0');
                packItemFields.map(function (packItemField) {
                    if (!tempVirtual[packItemField.name].includes(TypeToString(cur[packItemField.name], packItemField.type, locale))) {
                        tempVirtual[packItemField.name].push(TypeToString(cur[packItemField.name], packItemField.type, locale));
                    }
                });
            }
        }
        return acc;
      }, [])
    }
    return tempVirtuals;
  }

module.exports = router;