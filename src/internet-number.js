import axios from 'axios'
import readline from 'readline'

function isCommentOrEmpty(line) {
  return line.startsWith('#') || /^\s*$/.test(line)
}

function isVersion(line) {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  return /^\d+\|/.test(line)
}

function parseVersion(line) {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  const [
    version
  , registry
  , serial
  , records
  , startdate, enddate
  , UTCoffset
  ] = line.split('|')

  return {
    version
  , registry
  , serial
  , records
  , startdate, enddate
  , UTCoffset
  }
}

function isSummary(line) {
  // registry|*|type|*|count|summary
  return /^[^\|]+\|[^\|]+\|[^\|]+\|[^\|]+\|\d+\|summary$/.test(line)
}

function parseSummary(line) {
  // registry|*|type|*|count|summary
  const [registry,, type,, count, summary] = line.split('|')

  return { registry, type, count, summary }
}

function isRecord(line) {
  // registry|cc|type|start|value|date|status[|extensions...]
  return /^[^\|]+\|[A-Z]{2}\|[^\|]+\|[^\|]+\|[^\|]+\|[^\|]+\|[^\|]+/.test(line)
}

function parseRecord(line) {
  // registry|cc|type|start|value|date|status[|extensions...]
  const [
    registry
  , cc
  , type
  , start
  , value
  , data
  , status
  , ...extensions
  ] = line.split('|')

  return {
    registry
  , cc
  , type
  , start
  , value
  , data
  , status
  , extensions
  }
}

export function getInternetNumber() {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get(
        'http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest'
      , { responseType: 'stream' }
      )
      const rl = readline.createInterface({ input: res.data })

      let isFileHeader = true
        , version = null
        , summaries = []
        , records = []

      rl.on('close', () => resolve({
        header: {
          version
        , summaries
        }
      , records
      }))
      rl.on('line', line => {
        if (isCommentOrEmpty(line)) {
          return
        } else if (isFileHeader) {
          if (isVersion(line)) {
            return void (version = parseVersion(line))
          } else if (isSummary(line)) {
            return void summaries.push(parseSummary(line))
          } else {
            isFileHeader = false
          }
        } else if (isRecord(line)) {
          return void records.push(parseRecord(line))
        } else {
          throw new Error("Can't parse the apnic file, module internet-number may be outdated")
        }
      })
    } catch(e) {
      reject(e)
    }
  })
}

export default getInternetNumber
