import express from 'express';

const app = express();
const port = 5000 || process.env.PORT;

const routes = require('./routes/index');

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
