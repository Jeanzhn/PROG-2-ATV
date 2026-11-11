import express from 'express';
import path from 'path';
import rotas from './routes';

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(rotas);

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});