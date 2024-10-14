const express = require('express');
const path = require('path');
const app = express();

// Servir des fichiers statiques (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route pour la page des articles
app.get('/article.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'article.html'));
});

// Route pour la page des sous articles
app.get('/article1.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'article1.html'));
});

// Route pour la page du forum
app.get('/forum.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forum.html'));
});

// Route pour la page des atelirs
app.get('/atelier.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'atelier.html'));
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
