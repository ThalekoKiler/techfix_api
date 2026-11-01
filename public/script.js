const API_URL = 'http://localhost:3000';

// Elementos da interface
const authForms = document.getElementById('auth-forms');
const userInfo = document.getElementById('user-info');
const loggedUserName = document.getElementById('logged-user-name');
const btnLogout = document.getElementById('btn-logout');
const gamesContainer = document.getElementById('games-container');
const btnReload = document.getElementById('btn-reload');

// Painel de Estatísticas
const statsPanel = document.getElementById('stats-panel');
const statTotal = document.getElementById('stat-total');
const statConcluidos = document.getElementById('stat-concluidos');
const statJogando = document.getElementById('stat-jogando');
const statDesejados = document.getElementById('stat-desejados');
const statMedia = document.getElementById('stat-media');

// Filtros
const filterSearch = document.getElementById('filter-search');
const filterStatus = document.getElementById('filter-status');
const filterPlatform = document.getElementById('filter-platform');
const btnFilter = document.getElementById('btn-filter');
const btnClearFilter = document.getElementById('btn-clear-filter');

// 1. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchGames();
});

// 2. Gerenciamento de Sessão com JWT
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        authForms.classList.add('hidden');
        userInfo.classList.remove('hidden');
        loggedUserName.textContent = user.name || 'Usuário';
        statsPanel.classList.remove('hidden');
        fetchStats();
    } else {
        authForms.classList.remove('hidden');
        userInfo.classList.add('hidden');
        statsPanel.classList.add('hidden');
    }
}

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuth();
    alert('Você saiu da sua conta.');
});

// 3. Login
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.error || 'Erro no login.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name || email }));
        checkAuth();
        fetchGames();
        alert('Logado com sucesso!');
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});

// 4. Cadastro de Usuário
document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/usuario/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                const msgs = data.errors.map(err => `• ${err.campo}: ${err.mensagem}`).join('\n');
                return alert(`Erros de validação:\n${msgs}`);
            }
            return alert(data.error || data.details || 'Erro no cadastro.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ id: data.userId, name }));
        checkAuth();
        fetchGames();
        alert('Conta criada com sucesso!');
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});

// 5. Estatísticas do Usuário (GET /usuario/estatisticas)
async function fetchStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/usuario/estatisticas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return;

        const stats = await res.json();
        statTotal.textContent = stats.totalGames ?? 0;
        statConcluidos.textContent = stats.concluidos ?? 0;
        statJogando.textContent = stats.jogando ?? 0;
        statDesejados.textContent = stats.desejados ?? 0;
        statMedia.textContent = stats.mediaNotas !== undefined ? Number(stats.mediaNotas).toFixed(1) : '0.0';
    } catch (err) {
        console.error('Falha ao buscar estatísticas:', err);
    }
}

// 6. Listagem de Jogos com Filtros (GET /games?search=&status=&platform=)
async function fetchGames() {
    gamesContainer.innerHTML = '<p class="placeholder-text">Atualizando lista...</p>';

    const params = new URLSearchParams();
    if (filterSearch.value.trim()) params.append('search', filterSearch.value.trim());
    if (filterStatus.value) params.append('status', filterStatus.value);
    if (filterPlatform.value.trim()) params.append('platform', filterPlatform.value.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
        const res = await fetch(`${API_URL}/games${queryString}`);
        const games = await res.json();

        if (!res.ok) {
            return gamesContainer.innerHTML = '<p class="placeholder-text">Erro ao buscar jogos.</p>';
        }

        if (!Array.isArray(games) || games.length === 0) {
            return gamesContainer.innerHTML = '<p class="placeholder-text">Nenhum jogo encontrado.</p>';
        }

        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

        gamesContainer.innerHTML = games.map(game => `
      <div class="game-card">
        ${game.image ? `<img src="${game.image}" alt="Capa de ${game.title}" class="game-cover">` : ''}
        <div class="game-content">
          <h4>${game.title}</h4>
          <div class="game-info">
            <p><strong>Gênero:</strong> ${game.genre}</p>
            <p><strong>Plataforma:</strong> ${game.platform}</p>
            <p><strong>Status:</strong> ${game.status}</p>
            <p><strong>Nota:</strong> ${game.rating !== null ? game.rating : 'N/A'}</p>
            <p><strong>Cadastrado por:</strong> ${game.user ? game.user.name : 'Desconhecido'}</p>
          </div>
        </div>
        ${game.userId === currentUserId ? `
          <button class="btn-danger" onclick="deleteGame(${game.id})">Remover</button>
        ` : ''}
      </div>
    `).join('');
    } catch (err) {
        gamesContainer.innerHTML = '<p class="placeholder-text">Falha ao carregar jogos da API.</p>';
    }
}

btnReload.addEventListener('click', fetchGames);
btnFilter.addEventListener('click', fetchGames);
btnClearFilter.addEventListener('click', () => {
    filterSearch.value = '';
    filterStatus.value = '';
    filterPlatform.value = '';
    fetchGames();
});

// 7. Criar Jogo com Upload de Imagem (FormData via POST /games)
document.getElementById('form-game').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        return alert('Faça login primeiro para cadastrar um jogo!');
    }

    const title = document.getElementById('game-title').value;
    const genre = document.getElementById('game-genre').value;
    const platform = document.getElementById('game-platform').value;
    const rating = document.getElementById('game-rating').value;
    const status = document.getElementById('game-status').value;
    const imageInput = document.getElementById('game-image');

    if (status === 'desejado' && rating) {
        return alert('Você não pode avaliar um jogo com status "desejado"!');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('platform', platform);
    if (rating) formData.append('rating', rating);
    formData.append('status', status);

    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/games`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                const msgs = data.errors.map(err => `• ${err.campo}: ${err.mensagem}`).join('\n');
                return alert(`Erros de validação:\n${msgs}`);
            }
            return alert(data.error || 'Erro ao cadastrar jogo.');
        }

        document.getElementById('form-game').reset();
        fetchGames();
        fetchStats();
        alert('Jogo cadastrado com sucesso!');
    } catch (err) {
        alert('Erro de conexão ao criar jogo.');
    }
});

// 8. Deletar Jogo (DELETE Protegido)
async function deleteGame(id) {
    const token = localStorage.getItem('token');
    if (!token) return alert('Acesso não autorizado.');

    if (!confirm('Tem certeza que deseja remover este jogo?')) return;

    try {
        const res = await fetch(`${API_URL}/games/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.error || 'Erro ao deletar jogo.');
        }

        fetchGames();
        fetchStats();
        alert('Jogo removido com sucesso!');
    } catch (err) {
        alert('Erro de conexão ao deletar jogo.');
    }
}