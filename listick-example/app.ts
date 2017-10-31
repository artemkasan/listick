import * as http from "http";
import * as express from "express";
import * as path from "path";

var app = express();

app.get('/dist/*',(req, res) =>
{
	console.log('static file request : ' + req.params[0]);
	res.sendFile(path.join(__dirname, 'dist', req.params[0]));
});
app.get(['/', '/home'], (req, res) => {
	res.sendFile(path.join(__dirname, '/client/index.html'))
  });

app.use(express.static('dist'));

app.listen(3000, () => {
  console.log('Open browser http://localhost:3000');
});