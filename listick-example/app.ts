import * as http from "http";
import * as express from "express";
import * as path from "path";

var app = express();

function getDegree() : number
{
	const min = -30;
	const max = 45;
	return Math.round(Math.random() * (max - min) + min);
}

app.get('/dist/*',(req, res) =>
{
	console.log('static file request : ' + req.params[0]);
	res.sendFile(path.join(__dirname, 'dist', req.params[0]));
});

app.get(['/', '/home', '/counter', '/weather', ], (req, res) => {
	res.sendFile(path.join(__dirname, '/client/index.html'))
	});

app.get('/api/weather', (req, res) => {
	setTimeout(() =>
	{
		res.send(JSON.stringify(
			[
				{ id: 1, name: "London", degree: getDegree()},
				{ id: 2, name: "Rome", degree: getDegree()},
				{ id: 3, name: "Berlin", degree: getDegree()},
				{ id: 4, name: "Paris", degree: getDegree()}
			]
		));
	}, 2000);
});

app.use(express.static('dist'));

app.listen(3000, () => {
	console.log('Open browser http://localhost:3000');
});