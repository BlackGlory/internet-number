# internet-number [![npm](https://img.shields.io/npm/v/internet-number.svg?maxAge=2592000)](https://www.npmjs.com/package/internet-number) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/BlackGlory/internet-number/master/LICENSE) [![Build Status](https://travis-ci.org/BlackGlory/internet-number.svg?branch=master)](https://travis-ci.org/BlackGlory/internet-number) [![Coverage Status](https://coveralls.io/repos/github/BlackGlory/internet-number/badge.svg)](https://coveralls.io/github/BlackGlory/internet-number)

Fetch and parse APNIC delegated internet number resources

## Installation

```sh
yarn add internet-number
```

```javascript
import getInternetNumber from 'internet-number'
// OR
import { getInternetNumber } from 'internet-number'
```

## Usage

```javascript
getInternetNumber()
.then(data => {
  console.log(data) // see below
})
```

## Structure

```javascript
{
  header: {
    version: {
      version
    , registry
    , serial
    , records
    , startdate, enddate
    , UTCoffset
    }
  , summaries: [
      { registry, type, count, summary }
    ]
  }
, records: [
    {
      registry
    , cc
    , type
    , start
    , value
    , date
    , status
    , extensions  
    }
  ]
}
```
