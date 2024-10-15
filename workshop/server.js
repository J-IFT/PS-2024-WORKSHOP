const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Importer SQLite3

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ouvrir ou créer la base de données SQLite
const db = new sqlite3.Database('./cleanweb.db', (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données :', err);
    } else {
        console.log('Base de données SQLite connectée.');

        // Créer les tables si elles n'existent pas déjà
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS threads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    author TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    thread_id INTEGER,
                    author TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
                )
            `);

			// Vérifier si la base de données est vide avant d'insérer les threads par défaut
			db.get('SELECT COUNT(*) AS count FROM threads', (err, row) => {
				if (err) {
					console.error('Erreur lors de la vérification de la base de données :', err);
				} else if (row.count === 0) {
					console.log('Base de données vide. Insertion des threads et commentaires par défaut.');

					// Insérer des threads d'exemple avec des commentaires variés
					const exampleThreads = [
						{ id: 1, author: 'Alice', title: 'Comment reconnaître un email de phishing ?', message: 'Je reçois de plus en plus d\'emails suspects. Quels sont les signes qui montrent qu\'un email est un phishing ?' },
						{ id: 2, author: 'Bob', title: 'Arnaques sur les réseaux sociaux', message: 'J\'ai remarqué plusieurs annonces sur Facebook qui semblent être des arnaques. Quelqu\'un d\'autre a-t-il eu ce problème ?' },
						{ id: 3, author: 'Claire', title: 'Signaler un site web douteux', message: 'J\'ai visité un site web qui semble frauduleux. Comment puis-je le signaler ?' }
					];

					exampleThreads.forEach((thread) => {
						const insertThread = 'INSERT INTO threads (author, title, message) VALUES (?, ?, ?)';
						db.run(insertThread, [thread.author, thread.title, thread.message], function (err) {
							if (err) {
								console.error('Erreur lors de l\'ajout du thread d\'exemple :', err);
							} else {
								const threadId = this.lastID; // Récupérer l'ID du thread ajouté

								// Ajouter des commentaires pour chaque thread avec le champ thread_id
								const exampleComments = [
									{ thread_id: 1, author: 'John', message: 'C’est toujours difficile de détecter les emails suspects, il faut être très vigilant.' },
									{ thread_id: 1, author: 'Sara', message: 'Merci pour ce sujet, je trouve ça vraiment utile. Les signes les plus clairs sont souvent les liens suspects et les pièces jointes inattendues.' },
									{ thread_id: 1, author: 'Paul', message: 'La plupart du temps, les fautes d’orthographe ou les offres trop alléchantes sont des indices.' },

									{ thread_id: 2, author: 'Emily', message: 'J\'ai aussi remarqué de nombreuses annonces frauduleuses sur Instagram. C\'est vraiment inquiétant.' },
									{ thread_id: 2, author: 'Michael', message: 'Faites attention à ne pas cliquer sur ces liens, c’est souvent du phishing.' },
									{ thread_id: 2, author: 'Laura', message: 'Les réseaux sociaux deviennent de plus en plus infestés par ces arnaques. Un signalement rapide est essentiel.' },
									{ thread_id: 2, author: 'David', message: 'J\'ai signalé plusieurs annonces de ce type, mais elles réapparaissent souvent sous une autre forme.' },

									{ thread_id: 3, author: 'Anna', message: 'Pour signaler un site frauduleux, vous pouvez passer par des plateformes comme Signal-Arnaques ou directement contacter les autorités.' },
									{ thread_id: 3, author: 'Leo', message: 'Je recommande aussi d’utiliser des extensions de navigateur qui bloquent les sites suspects.' },
									{ thread_id: 3, author: 'Maya', message: 'Est-ce que quelqu’un a déjà utilisé un service pour vérifier la sécurité d’un site ?' },
									{ thread_id: 3, author: 'Tom', message: 'Oui, il existe des services comme VirusTotal pour scanner les URL et vérifier si elles sont sécurisées.' },
									{ thread_id: 3, author: 'Nina', message: 'J\'ai récemment eu affaire à un site qui demandait des informations personnelles étranges. J’ai immédiatement quitté.' }
								];

								exampleComments.forEach(comment => {
									const insertComment = 'INSERT INTO comments (thread_id, author, message) VALUES (?, ?, ?)';
									db.run(insertComment, [comment.thread_id, comment.author, comment.message], (err) => {
										if (err) {
											console.error(`Erreur lors de l'ajout du commentaire de ${comment.author} :`, err);
										}
									});
								});
							}
						});
					});
				} else {
					console.log('Base de données déjà peuplée.');
				}
			});
        });
    }
});

// Route pour créer un nouveau thread
app.post('/api/add_thread', (req, res) => {
    const { author, title, message } = req.body;

    if (!author || !title || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const query = 'INSERT INTO threads (author, title, message) VALUES (?, ?, ?)';
    db.run(query, [author, title, message], function(err) {
        if (err) {
            console.error('Erreur lors de la création du thread :', err);
            return res.status(500).send('Erreur serveur');
        }
        // Renvoyer le thread créé avec son ID
        res.status(201).json({ id: this.lastID, author, title, message });
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

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des threads :', err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(rows);
        }
    });
});

// Route pour ajouter un commentaire à un thread
app.post('/api/threads/:id/add_comment', (req, res) => {
    const threadId = req.params.id;
    const { author, message } = req.body;

    const query = 'INSERT INTO comments (thread_id, author, message) VALUES (?, ?, ?)';
    db.run(query, [threadId, author, message], function(err) {
        if (err) {
            console.error('Erreur lors de l\'ajout du commentaire :', err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(201).json({ id: this.lastID, author, message });
    });
});

// Route pour récupérer un thread et ses commentaires
app.get('/api/threads/:id', (req, res) => {
    const threadId = req.params.id;

    db.get('SELECT * FROM threads WHERE id = ?', [threadId], (err, thread) => {
        if (err || !thread) {
            return res.status(404).send('Thread non trouvé');
        }

        db.all('SELECT * FROM comments WHERE thread_id = ?', [threadId], (err, comments) => {
            if (err) {
                console.error('Erreur lors de la récupération des commentaires :', err);
                return res.status(500).send('Erreur serveur');
            }
            res.json({ thread, comments });
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
