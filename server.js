const os = require('os')
const express = require('express')
const dotenv = require('dotenv')
const app = express()
const port = 8080
const fs = require('fs-extra')

var morgan = require('morgan')
app.use(morgan('combined'))

dotenv.config()
let jsonObject = {}

// Read jeosn file from path
const readJsonFile = async () => {
  try {
    jsonObject = await fs.readJson(process.env.JSONFILE)
  } catch (err) {
    console.error(err)
  }
}

readJsonFile() // prints your json object

app.get('/', (req, res) => {
  res.json({
    version: process.env.APPVERSION,
    hostname: os.hostname(),
    uptime: process.uptime()
  })
})

app.get('/namespaces', (req, res) => {
  res.json(Object.keys(jsonObject))
})

app.get('/reports', (req, res) => {
  const namespace = req.query.namespace;
  if (namespace in jsonObject) 
    res.json(jsonObject[namespace])
  else
    res.json({})
})

app.listen(port, () => {
  console.log(`Jrest app listening at http://localhost:${port}`)
})