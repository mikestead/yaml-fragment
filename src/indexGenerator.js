const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const { isCollectionFile, renderCollectionFile } = require('./collectionGenerator')

exports.genIndex = genIndex
exports.replaceFileRefs = replaceFileRefs

/**
 * Generate the root index yaml file and write it to disk.
 *
 * Formulates the index yaml file from fragments, generates any collection yaml files along the way.
 *
 * @param {Options} opt document generation options
 */
function genIndex(opt) {
  const contents = replaceFileRefs(opt)
  mkdirp.sync(path.dirname(opt.outFile))
  fs.writeFileSync(opt.outFile, contents, 'utf8')
}

/**
 * Starting from the root file specified, recursively replace all
 * $refs to local files with the corresponding yaml fragment and return the
 * resolved document.
 *
 * @param {Options} opt document generation options
 * @returns {String} The resolved yaml document
 */
function replaceFileRefs(opt) {
  const dirPath = path.dirname(opt.indexFile)
  const doc = fs.readFileSync(opt.indexFile, 'utf8')
  return processFragment(doc, dirPath, opt)
}

/**
 * 1. find all refs in fragment
 * 2. for each ref
 *    - determine its white space indent
 *    - resolve its fragment
 *    - apply indent to all lines of fragment
 *    - recurse from 1 with this fragment
 *    - insert resolved fragment tree into original fragment
 * 3. return resolved fragment
 *
 * @param {string} fragment contents of a yaml fragment to process
 * @param {string} dirPath directory where the fragment resides
 * @param {Options} opt document generation options
 * @returns {string} The recursively resolved yaml fragment contents
 */
function processFragment(fragment, dirPath, opt) {
  let results = fragment.match(/^[ ]*(- )?\$ref: \.\.?\/.+\.ya?ml$/gm)
  while (results && results.length > 0) {
    const ref = results.shift()
    const fragPath = path.join(dirPath, ref.substr(ref.indexOf('.')))
    const isList = ref.trim().indexOf('-') === 0
    let ws = ref.match(/^\s*/)[0]
    let nextFragment = loadFragment(fragPath, opt)
    const lines = nextFragment.split('\n')
    let mark = ws
    if (isList) {
      mark += '- '
      ws += opt.indent
    }
    nextFragment = mark + lines.join(`\n${ws}`).trim()
    nextFragment = processFragment(nextFragment, path.dirname(fragPath), opt)
    fragment = fragment.split(ref).join(nextFragment)
  }
  return fragment
}

const fragCache = {}

/**
 * Load the contents of a yaml fragment.
 *
 * If the path targets a .map.yml or .list.yml we generate
 * that in memory and return it.
 *
 * @param {string} fragPath path to yaml fragment document
 * @param {Options} opt document generation options
 * @returns {String} The contents of the yaml fragment
 */
function loadFragment(fragPath, opt) {
  if (fragCache[fragPath]) return fragCache[fragPath]
  let contents
  if (isCollectionFile(fragPath)) {
    contents = renderCollectionFile(fragPath, opt)
  } else {
    contents = fs.readFileSync(fragPath, 'utf8')
  }
  fragCache[fragPath] = contents
  return contents
}
