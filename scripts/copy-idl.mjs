import fs from 'fs'
import path from 'path'

const src  = path.resolve('./target/idl/covenant.json')
const dest = path.resolve('./app/src/idl/covenant.json')

if (!fs.existsSync(src)) {
  console.error('IDL not found. Run: anchor build')
  process.exit(1)
}

fs.copyFileSync(src, dest)
console.log('IDL copied to app/src/idl/covenant.json')
