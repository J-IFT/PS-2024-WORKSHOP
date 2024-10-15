const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "cleanweb"
});

// Connecte-toi à MySQL
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    // Créer la base de données et les tables si elles n'existent pas
    db.query("CREATE DATABASE IF NOT EXISTS cleanweb", function (err, result) {
        if (err) throw err;
        console.log("Database created");

        // Utiliser la base de données
        db.query("USE cleanweb", function (err) {
            if (err) throw err;

            // Supprimer les tables si elles existent pour réinitialiser à chaque démarrage
            db.query("DROP TABLE IF EXISTS comments");
            db.query("DROP TABLE IF EXISTS threads");

            // Créer la table threads
            const createThreadsTable = `
                CREATE TABLE IF NOT EXISTS threads (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    author VARCHAR(255) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createCommentsTable = `
                CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    thread_id INT,
                    author VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
                )
            `;

            // Créer les tables et insérer les threads et commentaires par défaut
            db.query(createThreadsTable, function (err) {
                if (err) throw err;
                console.log("Table 'threads' created");

                db.query(createCommentsTable, function (err) {
                    if (err) throw err;
                    console.log("Table 'comments' created");

                    // Insérer des threads d'exemple
                    const exampleThreads = [
                        { author: 'Alice', title: 'Comment reconnaître un email de phishing ?', message: 'Je reçois de plus en plus d\'emails suspects. Quels sont les signes qui montrent qu\'un email est un phishing ?' },
                        { author: 'Bob', title: 'Arnaques sur les réseaux sociaux', message: 'J\'ai remarqué plusieurs annonces sur Facebook qui semblent être des arnaques. Quelqu\'un d\'autre a-t-il eu ce problème ?' },
                        { author: 'Claire', title: 'Signaler un site web douteux', message: 'J\'ai visité un site web qui semble frauduleux. Comment puis-je le signaler ?' }
                    ];

                    exampleThreads.forEach((thread, index) => {
                        const insertThread = 'INSERT INTO threads (author, title, message) VALUES (?, ?, ?)';
                        db.query(insertThread, [thread.author, thread.title, thread.message], (err, result) => {
                            if (err) throw err;
                            console.log(`Thread ajouté : ${thread.title}`);

                            const threadId = result.insertId; // Récupérer l'ID du thread ajouté

                            // Ajouter des commentaires par défaut pour chaque thread
                            const exampleComments = [
                                { author: 'John', message: 'Je pense que c\'est un bon conseil.', threadId: threadId },
                                { author: 'Jane', message: 'Merci pour l\'information.', threadId: threadId }
                            ];

                            exampleComments.forEach(comment => {
                                const insertComment = 'INSERT INTO comments (thread_id, author, message) VALUES (?, ?, ?)';
                                db.query(insertComment, [comment.threadId, comment.author, comment.message], (err) => {
                                    if (err) throw err;
                                    console.log(`Commentaire ajouté par ${comment.author} pour le thread ${thread.title}`);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Route pour créer un nouveau thread
app.post('/api/thread', (req, res) => {
    const { author, title, message } = req.body;

    // Vérifie si tous les champs sont fournis
    if (!author || !title || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const query = 'INSERT INTO threads (author, title, message) VALUES (?, ?, ?)';

    db.query(query, [author, title, message], (err, result) => {
        if (err) {
            console.error('Erreur lors de la création du thread :', err);
            return res.status(500).send('Erreur serveur');
        }
        // Renvoyer le thread créé avec son ID
        res.status(201).json({ id: result.insertId, author, title, message });
    });
});

// Route pour récupérer tous les threads
app.get('/api/threads', (req, res) => {
	const query = `
		SELECT threads.*, COUNT(comments.id) AS commentCount
		FROM threads
		LEFT JOIN comments ON threads.id = comments.thread_id
		GROUP BY threads.id
		ORDER BY threads.created_at DESC
	`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des threads :', err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(results);
        }
    });
});

// Route pour ajouter un commentaire à un thread
app.post('/api/threads/:id/comments', (req, res) => {
    const threadId = req.params.id;
    const { author, message } = req.body;
    const query = 'INSERT INTO comments (thread_id, author, message) VALUES (?, ?, ?)';

    db.query(query, [threadId, author, message], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout du commentaire :', err);
            res.status(500).send('Erreur serveur');
        } else {
            res.status(201).json({ message: 'Commentaire ajouté avec succès' });
        }
    });
});

// Route pour récupérer un thread et ses commentaires
app.get('/api/threads/:id', (req, res) => {
    const threadId = req.params.id;

    // Récupérer le thread
    db.query('SELECT * FROM threads WHERE id = ?', [threadId], (err, threadResult) => {
        if (err || threadResult.length === 0) {
            res.status(404).send('Thread non trouvé');
            return;
        }

        // Récupérer les commentaires associés au thread
        db.query('SELECT * FROM comments WHERE thread_id = ?', [threadId], (err, commentResults) => {
            if (err) {
                console.error('Erreur lors de la récupération des commentaires :', err);
                res.status(500).send('Erreur serveur');
            } else {
                // Envoyer le thread et ses commentaires
                res.json({
                    thread: threadResult[0],
                    comments: commentResults
                });
            }
        });
    });
});

// Routes pour servir des fichiers statiques et les pages HTML
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Autres routes pour les différentes pages
app.get('/forum.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forum.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
