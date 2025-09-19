import express from 'express';
import 'dotenv/config';
import mainRouter from './routes/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Top-level middleware
app.use(express.json());

// Mount the main router
app.use('/api', mainRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
