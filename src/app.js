import express from 'express'
import cors from "cors";
import {router} from './routes.js'

const app = express();

// Habilita CORS
app.use(cors());
app.use(express.json());

// Configura CORS Headers


app.use(router);


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});