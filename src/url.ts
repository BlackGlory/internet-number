export enum Registry {
  AFRINIC = 'afrinic'
, APNIC = 'apnic'
, ARIN = 'arin'
, LACNIC = 'lacnic'
, RIPE_NCC = 'ripencc'
}

export enum Domain {
  AFRINIC = 'afrinic.net'
, APNIC = 'apnic.net'
, ARIN = 'arin.net'
, LACNIC = 'lacnic.net'
, RIPE_NCC = 'ripe.net'
}

export function createLatestURL(domain: Domain, registry: Registry) {
  return `ftp://ftp.${domain}/pub/stats/${registry}/delegated-${registry}-latest`
}

export function createLatestChecksumURL(domain: Domain, registry: Registry) {
  return createLatestURL(domain, registry) + '.md5'
}

export function createExtendedLatestURL(domain: Domain, registry: Registry) {
  return `ftp://ftp.${domain}/pub/stats/${registry}/delegated-${registry}-extended-latest`
}

export function createExtendedLatestChecksumURL(domain: Domain, registry: Registry) {
  return createExtendedLatestURL(domain, registry) + '.md5'
}
