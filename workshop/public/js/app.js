document.addEventListener("DOMContentLoaded", function() {
    // Afficher la pop-up lors du clic sur les boutons "Inscrivez-vous"
    document.querySelectorAll('[id^="register-button"]').forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
            document.getElementById("popup").style.display = "block"; // Afficher la pop-up
        });
    });

    // Fermer la pop-up
    document.getElementById("close-popup").addEventListener("click", function() {
        document.getElementById("popup").style.display = "none"; // Cacher la pop-up
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Afficher la pop-up lors du clic sur les boutons "Inscrivez-vous"
    document.querySelectorAll('[id^="register-button"]').forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
            document.getElementById("popup").style.display = "block"; // Afficher la pop-up
        });
    });

    // Fermer la pop-up
    document.getElementById("close-popup").addEventListener("click", function() {
        document.getElementById("popup").style.display = "none"; // Cacher la pop-up
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("new-topic-form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Empêche la soumission du formulaire

        const author = document.getElementById("author").value; // Récupère le prénom
        const title = document.getElementById("title").value; // Titre du sujet
        const content = document.getElementById("message").value; // Contenu du message

        // Créer un nouvel élément pour le sujet
        const newTopic = document.createElement("div");
        newTopic.classList.add("forum-topic");
        newTopic.innerHTML = `
            <h3>${title}</h3>
            <p><strong>Auteur :</strong> ${author}</p> <!-- Affiche le prénom -->
            <p>${content}</p>
            <a href="#" class="button">Répondre</a>
        `;

        // Ajouter le nouveau sujet en haut de la liste
        document.querySelector("#forum h2 + div").prepend(newTopic);

        // Réinitialiser le formulaire
        form.reset();
    });
});

