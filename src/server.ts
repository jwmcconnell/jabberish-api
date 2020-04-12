require('dotenv').config();
import { connect } from './utils/connect';
connect();

const { app } = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});
