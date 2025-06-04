async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
    return token;
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = await checkAuth();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('http://localhost:5000/api/diary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            alert('Entry saved!');
            loadEntries();
            document.getElementById('entry-form').reset();
        } else {
            alert(data.message || 'Error saving entry.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});

async function loadEntries() {
    const token = await checkAuth();
    try {
        const response = await fetch('http://localhost:5000/api/diary', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const diaries = await response.json();
        const container = document.getElementById('entries-list');
        container.innerHTML = '';
        diaries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow p-4';
            const titleEl = document.createElement('h3');
            titleEl.className = 'text-lg font-bold mb-2';
            titleEl.textContent = entry.title;
            const contentEl = document.createElement('p');
            contentEl.className = 'text-gray-700 mb-2';
            contentEl.textContent = entry.content;
            card.appendChild(titleEl);
            card.appendChild(contentEl);
            if (entry.imageUrl) {
                const imgEl = document.createElement('img');
                imgEl.src = 'http://localhost:5000' + entry.imageUrl;
                imgEl.className = 'w-full h-48 object-cover rounded mb-2';
                card.appendChild(imgEl);
            }
            const dateEl = document.createElement('p');
            dateEl.className = 'text-sm text-gray-500';
            dateEl.textContent = new Date(entry.createdAt).toLocaleString();
            card.appendChild(dateEl);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred loading entries.');
    }
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(loadEntries);
});