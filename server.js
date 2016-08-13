var http = require('http')
var fs = require('fs')
var argv = require('minimist')(process.argv.slice(2))


const imagePath = require('path').resolve(__dirname, 'upload')
http.createServer(function(req, res) {
	console.log(req.url);
	var path = req.url == '/' ? 'index.html' : req.url.slice(1);
	if(path=='api/upload' && req.method == 'POST') {
		let body = ''
		req.on('data', (chunk)=> {
			body += chunk
		})
		req.on('end', ()=> {
			let filename = Date.now()
			let json = decodeBase64Image(body)
			if(!json) res.end(makeJsonStr(500, 'error base64'));
			else {
				fs.writeFile(`${imagePath}/${filename}.${json.type}`, json.data, function (err) {
					if(err){
						console.error(err);
						res.end(makeJsonStr(500, err.message))
					}else {
						res.end(makeJsonStr(200, `/upload/${filename}.${json.type}`))
					}
				})
			}
		})

	}else {
		fs.readFile(path, (err, data) => {
			if(err) {
				console.error(err)
				res.end();
			}else {
				res.end(data);
			}
		})
	}
}).listen(argv.p || 9999, function () {
	console.log(`http://localhost:${argv.p || 9999}`)
})
function makeJsonStr(code,message) {
	return JSON.stringify({code:code,message:message});
}
function decodeBase64Image (dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1].split('/')[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}