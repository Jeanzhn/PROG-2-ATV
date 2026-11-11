import express from 'express';
import rotas from './routes';

const app = express();

app.use(express.json());
app.use(rotas);

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`[Sistema Acadêmico] Servidor ativo na porta ${PORTA}`);
});