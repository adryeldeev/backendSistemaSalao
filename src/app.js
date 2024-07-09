import express from 'express'
import cors from "cors";
import {router} from './routes.js'

const app = express();

// Habilita CORS
app.use(cors());
app.use(express.json());

// Configura CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(router);


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});