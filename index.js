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
async function getBuildNotes(ids) {
  const projectIds = ids.join()
  const { data } = await axios.get(`https://app.liquidplanner.com/api/workspaces/158330/treeitems?include=note&filter[]=id=${projectIds}`, { auth })
  return data
  .filter(project => project.has_note)
  .map((project) => {
    const {id, note} = project
    return { id, note: note.note }
  })
}
function convertToCsv(data) {
  return Papa.unparse(data)
}
function writeCsv(csv) {
  return fs.writeFile('buildNotes.csv', csv, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
      console.log('It\'s saved!');
    }
  })
}
async function start() {
  const ids = await getProjectIds()
  const projects = await getBuildNotes(ids)
  const csv = convertToCsv(projects)
  writeCsv(csv)
}

start()