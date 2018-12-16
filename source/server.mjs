import path from 'path';
import express from 'express';

const PORT = process.env.PORT || 443;

let app = express();

app.use('/', express.static(path.join(path.resolve(), 'docs')));
app.listen(PORT, () => console.log(`Webpage on https://localhost:${ PORT }`));


