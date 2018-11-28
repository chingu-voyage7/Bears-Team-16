import 'ejs';
import express from 'express';
import path from 'path';
const PORT = process.env.PORT || 5000;

  express()
  .use(express.static(path.join(path.resolve(), 'public')))
  .set('views', path.join(path.resolve(), 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
