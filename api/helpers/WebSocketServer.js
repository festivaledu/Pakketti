const ws = require("ws");
const HttpRequestWrapper = require("./HttpRequestWrapper");

const controllers = require("../controllers");
const authHelper = require("./AuthHelper");

module.exports = (models, port = 62486) => {
	let mappedMethods = {};
	
	const map = (path, layer) => {
		if (layer.route) {
			layer.route.stack.forEach(map.bind(null, path.concat(split(layer.route.path))))
		} else if (layer.name === 'router' && layer.handle.stack) {
			layer.handle.stack.forEach(map.bind(null, path.concat(split(layer.regexp))))
		} else if (layer.method) {
			if (!mappedMethods[layer.method]) mappedMethods[layer.method] = {};
			
			const route = path.concat(split(layer.regexp)).filter(Boolean).join('/');
			mappedMethods[layer.method]["/" + route] = layer.handle;
		}
	}
	const split = (path) => {
		if (typeof path === 'string') {
			return path.split('/')
		} else if (path.fast_slash) {
			return ''
		} else {
			var match = path.toString()
				.replace('\\/?', '')
				.replace('(?=\\/|$)', '$')
				.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
			return match
				? match[1].replace(/\\(.)/g, '$1').split('/')
				: '<complex:' + path.toString() + '>'
		}
	}
	
	controllers.stack.forEach(map.bind(null, []));
	
	let socket = new ws.Server({ port: port });
	
	socket.on("connection", (ws) => {
		ws.on('message', (data) => {
			(async () => {
				const _data = JSON.parse(data);
				
				let rq = new HttpRequestWrapper.Request.createRequest(Object.assign(_data, {
					models: models
				}));
				await authHelper(rq, null, () => {});
				
				let rs = new HttpRequestWrapper.Response.createResponse({
					req: rq
				});

				if (mappedMethods[rq.method.toLowerCase()][rq.path]) {
					await mappedMethods[rq.method.toLowerCase()][rq.path](rq, rs);
				} else {
					return ws.send(JSON.stringify({
						_rqid: _data._rqid,
						statusCode: 404,
						body: `Cannot ${rq.method} /api/${rq.path}'`
					}));
				}

				ws.send(JSON.stringify(Object.assign(rs, {
					_rqid: _data._rqid,
					body: rs._getData()
				})));
			})();
		});

		ws.on('close', () => {

		});
	});
	
	return socket;
}