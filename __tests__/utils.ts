import fs from 'fs'
import path from 'path'
import { createTempNameSync } from 'extra-filesystem'
import { pass } from '@blackglory/pass'

export async function getStatisticsFileContent(): Promise<string> {
  const mockFs: typeof fs = await vi.importActual('fs')
  const filename = path.join(__dirname, './fixtures/statistics.txt')
  return mockFs.readFileSync(filename, 'utf-8')
}

export async function getChecksum(): Promise<string> {
  return (await getChecksumFileContent()).match(/[\w\d]{32}/)![0]
}

export async function getChecksumFileContent(): Promise<string> {
  const mockFs: typeof fs = await vi.importActual('fs')
  const filename = path.join(__dirname, './fixtures/checksum.md5')
  return mockFs.readFileSync(filename, 'utf-8')
}

export class FakeFile {
  filename = createTempNameSync()

  setup() {
    pass()
  }

  teardown() {
    if (fs.existsSync(this.getFilename())) {
      fs.rmSync(this.getFilename())
    }
  }

  getFilename(): string {
    return this.filename
  }

  exists(): boolean {
    return fs.existsSync(this.getFilename())
  }

  getContent(): string {
    return fs.readFileSync(this.getFilename(), 'utf-8')
  }
}
