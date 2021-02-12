/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses before getting approved by the original author.
 * Any use of code from these project should declare the original source it's from
 *
 */
"use strict"

const functions = {
  getEventTypes: (data) => {
    let evtTypes = `<select name="evt_type" required>\n<option value="" disabled>Please Select</option>`;
    for (let itemId in data) {
      // console.log(item + ": " + data[item] + "\n"
      //     + "is Object: " + (data[item] instanceof Object))
      let item = data[itemId]
      if (item instanceof Object) {
        // console.log(itemId, item)
        evtTypes += newSelectGroup(itemId, item)
      }
      else {
        if (isSelected(item))
          evtTypes += `\n<option value="${item}" selected>${item}</option>`
        else
          evtTypes += `\n<option value="${item}">${item}</option>`
      }
    }
    evtTypes += `\n</select>`
    console.log(evtTypes)
    return 0
    // data.forEach((id, item) => {
    //   console.log(id + ":" + item)
    //   console.log("is Object: " + (item instanceof Object))
    //   return 0
    //   // if (item instanceof Object) { // is a group
    //   //   item.forEach((groupItem) => {
    //   //
    //   //   })
    //   // }
    //   // else {
    //   //   evtTypes.append()
    //   // }
    // })

  }
}

// functions
function newSelectGroup(groupName, data) {
  let res = `\n\n<optgroup label="${groupName}">`
  for (let itemId in data) {
    let item = data[itemId]
    if (isSelected(item))
      res += `\n<option value="${item}" selected>${item}</option>`
    else
      res += `\n<option value="${item}">${item}</option>`
  }
  res += `\n</optgroup>\n`
  return res
}

function isSelected(recID, itemId) {
 if (selected == itemId) return true;
}

module.exports = functions