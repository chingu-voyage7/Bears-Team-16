import path from 'path';
import express from 'express';
let app = express();

app.use(express.static('.'));
// app.use('/', express.static(path.join(__dirname, 'public')))

console.log('Webpage at http://localhost:3000');