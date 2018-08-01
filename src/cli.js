#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const { AssertionError } = require('assert')
const { genDocument } = require('./index')

const opt = program
  .version(require('../package.json').version)
  .option('-d, --rootDir <dir>', 'root directory of your fragments', String)
  .option(
    '-i, --indexFile [fragment]',
    'index document which references fragments',
    String,
    './index.yml'
  )
  .option('-o, --outFile <file>', 'output file of the grouped fragments', String)
  .option('--openapi', 'openapi fragment processing')
  .parse(process.argv)

try {
  genDocument(opt)
  complete()
} catch (e) {
  error(e)
}

function complete() {
  console.info(chalk.bold.cyan(`Generated '${opt.outFile}'`))
  process.exit(0)
}

function error(e) {
  if (e.stack && !(e instanceof AssertionError)) {
    console.error(chalk.red('Unexpected error generating yaml document'))
    console.error(`  ${chalk.red(e.stack)}`)
  } else {
    const msg = e instanceof Error ? e.message : e
    console.error(chalk.red(msg))
  }
  process.exit(1)
}
