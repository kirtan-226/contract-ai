import 'dotenv/config'; 
import { createServer } from 'http';
import app from './app.js';
const PORT = process.env.PORT || 8080;

console.log('starting server.js');
createServer(app).listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
