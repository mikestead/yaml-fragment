#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const { genDocument } = require('./index')

const opt = program
  .version(require('../package.json').version)
  .option('-d, --rootDir <dir>', 'root directory of your fragments', String)
  .option(
    '-f, --rootFragment [fragment]',
    'root document which references fragments',
    String,
    './index.yml'
  )
  .option('-o, --outFile <file>', 'output file of the grouped fragments', String)
  .option('--openapi', 'openapi fragment processing')
  .parse(process.argv)

genDocument(opt.rootDir, opt.rootFragment, opt.outFile, opt).then(complete, error)

function complete() {
  console.info(chalk.bold.cyan(`Generated '${opt.outFile}'`))
  process.exit(0)
}

function error(e) {
  const msg = e instanceof Error ? e.message : e
  console.error(chalk.red(msg))
  process.exit(1)
}
