const httpStatus = require("http-status");
const path = require("path");
const camelcase = require("camelcase");

const ar = require("ar");
const tar = require("tar-stream");
const bufferstream = require("simple-bufferstream");
const gunzip = require("gunzip-maybe");
const controlParser = require("debian-control-parser");
const unzip = require("adm-zip");
const plist = require("plist");

module.exports = {
	/**
	 * This method tries to parse an archive file (.zip, .gz, or .deb) and returns usable package data.
	 * If not, it returns an error object describing the parse error.
	 */
	parseArchive: async (archiveData, identifier, name, architecture) => {
		let controlData;
		
		switch (archiveData.mimetype) {
			case "application/x-deb":
			case "application/x-debian-package":
				// Debian package (APT)
				controlData = await new Promise((resolve, reject) => {
					let archive = new ar.Archive(archiveData.data);
					archive.getFiles().forEach(file => {
						let filename = file.name();

						if (filename.includes("control.tar.gz")) {
							let extractor = tar.extract();

							extractor.on("entry", (header, stream, next) => {
								if (header.name.indexOf("control") !== -1) {
									let controlFile = controlParser(stream);
									controlFile.on("stanza", parsedControl => {
										return resolve(Object.fromEntries(Object.entries(parsedControl).map(([k, v]) => [camelcase(k), v])));
									});
								} else {
									next();
								}
							});

							bufferstream(file.fileData()).pipe(gunzip()).pipe(extractor);
						}
					});
				});

				if (!controlData) return {
					name: httpStatus[httpStatus.BAD_REQUEST],
					code: httpStatus.BAD_REQUEST,
					message: "Package file does not contain any control file"
				};
				
				if (controlData["package"] !== identifier ||
					controlData["name"] !== name ||
					controlData["architecture"] !== architecture) return {
					name: httpStatus[httpStatus.CONFLICT],
					code: httpStatus.CONFLICT,
					message: "Package file information does not match package data"
				};
				
				return controlData;
			case "application/zip":
				controlData = await new Promise((resolve, reject) => {
					let archive = new unzip(archiveData.data);
					
					archive.getEntries().forEach(file => {
						let filename = file.entryName;
						
						if (filename.includes("Info.json")) {
							let controlFile = JSON.parse(file.getData().toString("utf-8"));
							return resolve(Object.fromEntries(Object.entries(controlFile).map(([k, v]) => [camelcase(k), v])));
						} else if (filename.includes("Info.plist")) {
							let controlFile = plist.parse(file.getData().toString("utf-8"));
							return resolve(Object.fromEntries(Object.entries(controlFile).map(([k, v]) => [camelcase(k), v])));
						}
					});
				});
				
				if (!controlData) return {
					name: httpStatus[httpStatus.BAD_REQUEST],
					code: httpStatus.BAD_REQUEST,
					message: "Package file does not contain an Info.plist or Info.json file"
				};
				
				if (controlData["package"] !== identifier ||
					controlData["name"] !== name ||
					controlData["architecture"] !== architecture) return {
					name: httpStatus[httpStatus.CONFLICT],
					code: httpStatus.CONFLICT,
					message: "Package file information does not match package data"
				};
				
				return controlData;
			case "application/gzip":
					return {
						name: httpStatus[httpStatus.NOT_IMPLEMENTED],
						code: httpStatus.NOT_IMPLEMENTED,
						//message: "Package file does not have any known format"
					}
			default:
				return {
					name: httpStatus[httpStatus.BAD_REQUEST],
					code: httpStatus.BAD_REQUEST,
					message: "Package file does not have any known format"
				}
		}
	}
};