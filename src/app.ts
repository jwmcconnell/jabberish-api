const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', require('./routes/auth'));
app.get('/', (req, res) => res.send('Hello World!'));
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

export { app };
