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
