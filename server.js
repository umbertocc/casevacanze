const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'docs'), { extensions: ['html'] }));

// Fallback per altri file statici
app.use((req, res) => res.status(404).send('Pagina non trovata'));

app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});
