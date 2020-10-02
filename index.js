require('dotenv').config()
const axios = require('axios')
const Papa = require('papaparse')
const fs = require('fs')
const {
  password,
  username
} = process.env
const auth = { username, password }
async function getProjectIds() {
  const { data } = await axios.get('https://app.liquidplanner.com/api/workspaces/158330/reports/137076/data', { auth })
  return data.rows.map(row => row.key)
}
async function getLbsData(ids) {
  const projectIds = ids.join()
  const { data } = await axios.get(`https://app.liquidplanner.com/api/workspaces/158330/treeitems?filter[]=id=${projectIds}`, { auth })
  return data
  .map((project) => {
    const {id, custom_field_values} = project
    console.log(custom_field_values)
    return { id, ...custom_field_values }
  })
}
function convertToCsv(data) {
  return Papa.unparse(data)
}
function writeCsv(csv) {
  return fs.writeFile('lbs-download.json', JSON.stringify(csv), 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
      console.log('It\'s saved!');
    }
  })
}
async function start() {
  const ids = require('./ids')
  const projects = await getLbsData(ids)
  // const csv = convertToCsv(projects)
  writeCsv(projects)
}

start()