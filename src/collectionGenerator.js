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
 * @param {Object} options The available generation options
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
 * @param {string} baseDir
 * @returns {Promise|*}
 */
function findCollectionFiles(baseDir) {
	return new Promise((resolve, reject) => {
		glob(`${baseDir}/**/+(.map|.list)+(.yml|.yaml)`, {dot: true}, (err, files) => {
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
 * @param baseDir
 * @param filePath
 * @param options
 * @returns {Promise|*}
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
				.map(filePath => Object.assign({filePath}, path.parse(filePath)))
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
