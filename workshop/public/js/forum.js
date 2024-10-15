 // Fonction pour récupérer et afficher les threads
 function fetchThreads() {
	fetch('/api/threads')
		.then(response => response.json())
		.then(threads => {
			const threadsDiv = document.getElementById('threads');
			threadsDiv.innerHTML = ''; // Clear previous threads
			threads.forEach(thread => {
				const threadDiv = document.createElement('div');
				threadDiv.className = 'forum-topic';
				threadDiv.innerHTML = `
					<h3>${thread.title}</h3>
					<p><strong>Auteur :</strong> ${thread.author}</p>
					<p>${thread.message}</p>
					<a href="#" onclick="showComments(${thread.id})" class="button">Répondre</a>
					<div id="comments-${thread.id}"></div>
				`;
				threadsDiv.appendChild(threadDiv);
			});
		});
}
