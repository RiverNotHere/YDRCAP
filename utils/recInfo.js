const Records = require('../models/Record')

module.exports = {
    isSelected: async(recID, item) => {
        let rec = await Records.findById(recID)
        let selected = rec.event_type
        // console.log(selected)
        // console.log(item)
        // console.log(selected.toString() == item.toString())
        if (selected.toString() == item.toString()) return true
        else return false
    },
    newSelectGroup: async(groupName, data, recID) => {
        let res = `\n\n<optgroup label="${groupName}">`
        for (let itemId in data) {
            let item = data[itemId]
            // console.log(await isSelected(recID, item))
            if (await isSelected(recID, item))
                res += `\n<option value="${item}" selected>${item}</option>`
            else
                res += `\n<option value="${item}">${item}</option>`
        }
        res += `\n</optgroup>\n`
        return res
    }
}

async function isSelected(recID, item){
    let rec = await Records.findById(recID)
    let selected = rec.event_type
    // console.log(selected)
    // console.log(item)
    // console.log(selected.toString() == item.toString())
    if (selected.toString() == item.toString()) return true
    else return false
}