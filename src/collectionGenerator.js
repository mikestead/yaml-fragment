const path = require('path')
const glob = require('glob')
const util = require('./util')

exports.genCollectionFiles = genCollectionFiles
exports.findCollectionFiles = findCollectionFiles
exports.renderCollectionFile = renderCollectionFile

/**
 * Recursively searches baseDir for `.map.yml` and `.list.yml` files. When it finds one
 * it looks at every yaml file in the same directory, and then populates it
 * with a list or map of $ref's to each file.
 *
 * @param {String} baseDir The root directory to recursively scan for collection files to generate
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 *  - formatMapKey: Function to format a file to a yaml map key. Defaults to return raw filename.
 *  - quoteMapKeyRegex: Regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to null.
 *  - relativePaths: True if using relative paths in generated collection files. Defaults to true.
 * @returns {Promise.<T>} A promise which will resolve with all paths which have been ge
 */
function genCollectionFiles(baseDir, options) {
	options = util.applyDefaultOptions(options)
	return findCollectionFiles(baseDir)
		.then(paths => generateCollectionFiles(baseDir, paths, options))
}

/**
 * Recursively searches baseDir for `.map.yml` and `.list.yml` files.
 *
 * @param {String} baseDir Base directory to search for collection files
 * @returns {Promise|*} A promise which resolves with all found collection file paths.
 */
function findCollectionFiles(baseDir) {
	return new Promise((resolve, reject) => {
		glob(`${baseDir}/**/+(.map|.list)+(.yml|.yaml)`, { dot: true }, (err, files) => {
			if (err) reject(err)
			else resolve(files)
		})
	})
}

function generateCollectionFiles(baseDir, collectionFilePaths, options) {
	return Promise.all(collectionFilePaths.map(filePath =>
			renderCollectionFile(baseDir, filePath, options)
				.then(contents => util.writeFile(filePath, contents))
	)).then(() => collectionFilePaths)
}

/**
 * Render the contents of a `.map.yml` or `.list.yml` file.
 *
 * This contains references to all yaml files in the directory it resides
 * in a list or map yaml format.
 *
 * @param {String} baseDir Base directory where the collection file was found
 * @param {String} filePath Path to the collection file
 * @param {Object} options Rendering options
 * @returns {Promise|*} A Promise which resolves with the content of the colletion file
 */
function renderCollectionFile(baseDir, filePath, options) {
	const dirPath = path.dirname(filePath)
	const fileName = path.basename(filePath)
	const isMap = fileName.startsWith('.map')

	return new Promise((resolve, reject) => {
		glob(`${dirPath}/+(*.yml|*.yaml)`, (err, files) => {
			if (err) return reject(err)
			const autoGenComment = options.autoGenComment ? `${options.autoGenComment.trim()}\n` : ''
			const contents = files
				.map(filePath => Object.assign({ filePath }, path.parse(filePath)))
				.sort((a, b) => a.name.localeCompare(b.name))
				.reduce((s, file) => {
					const refPath = options.relativePaths ?
								file.base :
								path.relative(baseDir, file.filePath)
					if (isMap) {
						var key = options.formatMapKey(file)
						if (options.quoteMapKeyRegex && key.match(options.quoteMapKeyRegex)) {
							key = `'${key}'`
						}
						s += `${key}:\n${options.indent}`
					} else {
						s += '- '
					}
					return `${s}$ref: ./${refPath}\n`
				}, `${autoGenComment}`)
			resolve(contents)
		})
	})
}
