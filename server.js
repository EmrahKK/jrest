const os = require('os')
const express = require('express')
const dotenv = require('dotenv')
const app = express()
const port = 8080
const fs = require('fs-extra')
const yaml = require('js-yaml')

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

app.get('/reccomend', (req, res) => {
  const namespace = req.query.namespace
  const kind = req.query.kind
  const name = req.query.name
  const container = req.query.container
  const format = req.query.format
  
  let recommended = {}

  if (namespace in jsonObject) {
    for (var i = 0; i < jsonObject[namespace].length; i++) {
      if (jsonObject[namespace][i]["object"]["name"] == name && jsonObject[namespace][i]["object"]["kind"] == kind) {
          // Transform the JSON using reduce
          const transformedJson = {
            "resources": {
              "requests": transformSection(jsonObject[namespace][i]["recommended"]["requests"]),
              "limits": transformSection(jsonObject[namespace][i]["recommended"]["limits"])
            }              
          }

          if (format == "yaml") {
            // Convert the transformed JSON to YAML
            const yamlOutput = yaml.dump(transformedJson)
            res.send(yamlOutput)
          } else
            res.json(transformedJson)

      } else
      res.json({}) 
    }
  } else
    res.json({})
})

// Function to transform each section
const transformSection = (section) => {
    return Object.keys(section).reduce((acc, key) => {
        let value = section[key].value;

        if (key === 'memory' && value !== null) {
            value = (value / 1048576) + 'Mi'; // Convert to MB and add 'Mi' suffix
        } else if (key === 'cpu' && value !== null) {
            value = value;
        }

        if (value !== null) {
            acc[key] = value;
        }

        return acc;
    }, {});
};

app.listen(port, () => {
  console.log(`Jrest app listening at http://localhost:${port}`)
})