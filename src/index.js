const collectionGen = require('./collectionGenerator')
const indexGen = require('./indexGenerator')

/**
 * Generate a yaml document from an index yaml file which may references
 * other local yaml fragments.
 *
 * Any `.map.yml` or `.list.yml` collection files will be generated first if found.
 *
 * @param baseDir The root directory to search for collection files to generate
 * @param indexFile The index yaml file to base document generation off
 * @param outputFile The output path of the generated yaml document
 * @param options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 *  - formatMapKey: Function to format a file to a yaml map key. Defaults to return raw filename.
 *  - quoteMapKeyRegex: Regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to null.
 *  - relativePaths: True if using relative paths in generated collection files. Defaults to true.
 *
 * @returns {Promise.<T>}
 */
exports.genDocument = function(baseDir, indexFile, outputFile, options) {
	return collectionGen.genCollectionFiles(baseDir, options)
		.then(() => indexGen.genIndex(indexFile, outputFile, options))
}
