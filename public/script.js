const API_URL = 'http://localhost:3000';

// Elementos da interface
const authForms = document.getElementById('auth-forms');
const userInfo = document.getElementById('user-info');
const loggedUserName = document.getElementById('logged-user-name');
const gamesContainer = document.getElementById('games-container');
const btnReload = document.getElementById('btn-reload');

// Alternância de visualização: 'community' ou 'mygames'
let currentView = 'community';
const btnToggleView = document.getElementById('btn-toggle-view');
const catalogTitle = document.getElementById('catalog-title');

// Painel de Estatísticas
const statsPanel = document.getElementById('stats-panel');
const statTotal = document.getElementById('stat-total');
const statConcluidos = document.getElementById('stat-concluidos');
const statJogando = document.getElementById('stat-jogando');
const statDesejados = document.getElementById('stat-desejados');
const statMedia = document.getElementById('stat-media');

// Filtros
const filterSearch = document.getElementById('filter-search');
const filterPlatform = document.getElementById('filter-platform');
const btnFilter = document.getElementById('btn-filter');
const btnClearFilter = document.getElementById('btn-clear-filter');

// Elementos do Formulário de Jogos (Controle de UX)
const gameStatusSelect = document.getElementById('game-status');
const gameRatingInput = document.getElementById('game-rating');

// 1. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchGames();

    // Trava inicial caso comece em "desejado"
    if (gameStatusSelect && gameRatingInput) {
        if (gameStatusSelect.value === 'desejado') {
            gameRatingInput.value = '';
            gameRatingInput.disabled = true;
            gameRatingInput.placeholder = 'Nota desabilitada (Desejado)';
        }
    }
});

// 2. Gerenciamento de Sessão com JWT
async function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        authForms.classList.add('hidden');
        userInfo.classList.remove('hidden');
        loggedUserName.textContent = user.name || 'Usuário';
        statsPanel.classList.remove('hidden');
        fetchStats();

        // Garante que o nome exibido seja o nome real e não o e-mail
        if (!user.name || user.name.includes('@')) {
            try {
                const res = await fetch(`${API_URL}/usuario/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const userData = await res.json();
                    user.name = userData.name;
                    localStorage.setItem('user', JSON.stringify(user));
                    loggedUserName.textContent = userData.name;
                }
            } catch (err) {
                console.error('Erro ao verificar dados do usuário:', err);
            }
        }
    } else {
        authForms.classList.remove('hidden');
        userInfo.classList.add('hidden');
        statsPanel.classList.add('hidden');
    }
}

// 3. Função Global de Logout (Chamada direta pelo onclick)
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    currentView = 'community';
    if (catalogTitle) catalogTitle.textContent = 'Catálogo Comunitário';
    if (btnToggleView) btnToggleView.textContent = '📁 Ver Meus Jogos';

    authForms.classList.remove('hidden');
    userInfo.classList.add('hidden');
    statsPanel.classList.add('hidden');

    fetchGames();
    alert('Sessão encerrada com sucesso!');
}

// 4. Login
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
        localStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name }));

        await checkAuth();
        fetchGames();
        alert('Logado com sucesso!');
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});

// 5. Cadastro de Usuário
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

        await checkAuth();
        fetchGames();
        alert('Conta criada com sucesso!');
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});

// 6. Alternar entre Catálogo Comunitário e Meus Jogos
btnToggleView.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    if (currentView === 'community') {
        if (!token) {
            return alert('Faça login primeiro para gerenciar seus próprios jogos!');
        }
        currentView = 'mygames';
        catalogTitle.textContent = 'Meus Jogos Cadastrados';
        btnToggleView.textContent = '🌐 Ver Catálogo Comunitário';
    } else {
        currentView = 'community';
        catalogTitle.textContent = 'Catálogo Comunitário';
        btnToggleView.textContent = '📁 Ver Meus Jogos';
    }
    fetchGames();
});

// 7. Estatísticas do Usuário (GET /usuario/estatisticas)
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
        console.error('Falha ao obter estatísticas:', err);
    }
}

// 8. Badge Colorida para Notas
function getRatingBadge(rating) {
    if (rating === null || rating === undefined || rating === 'N/A') {
        return `<span style="background: #475569; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #fff;">N/A</span>`;
    }
    const num = parseFloat(rating);
    let color = '#22c55e'; // Verde
    if (num < 6) color = '#ef4444'; // Vermelho
    else if (num < 8) color = '#eab308'; // Amarelo

    return `<span style="background: ${color}; color: #0f172a; padding: 2px 8px; border-radius: 4px; font-weight: bold;">⭐ ${num.toFixed(1)}</span>`;
}

// 9. Listagem de Jogos
async function fetchGames() {
    gamesContainer.innerHTML = '<p class="placeholder-text">Atualizando lista...</p>';
    const token = localStorage.getItem('token');

    // MODO 1: Meus Jogos Cadastrados
    if (currentView === 'mygames') {
        try {
            const res = await fetch(`${API_URL}/games/user/mygames`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const games = await res.json();

            if (!res.ok || !Array.isArray(games) || games.length === 0) {
                return gamesContainer.innerHTML = '<p class="placeholder-text">Você ainda não cadastrou nenhum jogo.</p>';
            }

            gamesContainer.innerHTML = games.map(game => `
        <div class="game-card">
          ${game.image ? `<img src="${game.image}" alt="Capa de ${game.title}" class="game-cover">` : ''}
          <div class="game-content">
            <h4>${game.title}</h4>
            <div class="game-info">
              <p><strong>Gênero:</strong> ${game.genre}</p>
              <p><strong>Plataforma:</strong> ${game.platform}</p>
              <p><strong>Status:</strong> ${game.status}</p>
              <p><strong>Sua Nota:</strong> ${getRatingBadge(game.rating)}</p>
            </div>
            
            <a 
              href="https://www.google.com/search?q=${encodeURIComponent(game.title + ' jogo')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-secondary" 
              style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; margin-top: 10px; margin-bottom: 8px; padding: 6px 12px; font-size: 0.85rem; border-radius: 4px; width: 100%; box-sizing: border-box; text-align: center;">
              🔍 Mais Detalhes
            </a>
          </div>
          <button class="btn-danger" onclick="deleteGame(${game.id})">Remover Jogo</button>
        </div>
      `).join('');
        } catch (err) {
            gamesContainer.innerHTML = '<p class="placeholder-text">Erro ao buscar seus jogos.</p>';
        }
        return;
    }

    // MODO 2: Catálogo Comunitário Unificado
    const params = new URLSearchParams();
    if (filterSearch.value.trim()) params.append('search', filterSearch.value.trim());
    if (filterPlatform.value.trim()) params.append('platform', filterPlatform.value.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
        const res = await fetch(`${API_URL}/games${queryString}`);
        const games = await res.json();

        if (!res.ok || !Array.isArray(games) || games.length === 0) {
            return gamesContainer.innerHTML = '<p class="placeholder-text">Nenhum jogo encontrado no catálogo.</p>';
        }

        gamesContainer.innerHTML = games.map(game => `
      <div class="game-card">
        ${game.image ? `<img src="${game.image}" alt="Capa de ${game.title}" class="game-cover">` : ''}
        <div class="game-content">
          <h4>${game.title}</h4>
          <div class="game-info">
            <p><strong>Gênero:</strong> ${game.genre}</p>
            <p><strong>Plataforma:</strong> ${game.platform}</p>
            <p><strong>Média Comunitária:</strong> ${getRatingBadge(game.averageRating)}</p>
            <p><strong>👥 Avaliações:</strong> ${game.totalUsers} usuário(s)</p>
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-direction: column;">
            <!-- Botão de Detalhes no Google -->
            <a 
              href="https://www.google.com/search?q=${encodeURIComponent(game.title + ' jogo ' + (game.platform || ''))}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-secondary" 
              style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 0.85rem; border-radius: 4px; text-align: center;">
              🔍 Mais Detalhes
            </a>

            <!-- Botão de Trailer no YouTube -->
            <a 
              href="https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="background-color: #dc2626; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px 12px; font-size: 0.85rem; border-radius: 4px; font-weight: 600; text-align: center;">
              🎬 Ver Trailer
            </a>
          </div>
        </div>
      </div>
    `).join('');
    } catch (err) {
        gamesContainer.innerHTML = '<p class="placeholder-text">Falha ao carregar catálogo comunitário.</p>';
    }
}

btnReload.addEventListener('click', fetchGames);
btnFilter.addEventListener('click', fetchGames);
btnClearFilter.addEventListener('click', () => {
    filterSearch.value = '';
    filterPlatform.value = '';
    fetchGames();
});

// 10. Criar Jogo com Upload de Imagem (FormData via POST /games)
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
        return alert('Você não pode avaliar um jogo que está como desejado!');
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

        // Restaura o estado inicial do campo de nota após resetar o form
        if (gameStatusSelect.value === 'desejado') {
            gameRatingInput.disabled = true;
            gameRatingInput.placeholder = 'Nota desabilitada (Desejado)';
        }

        fetchGames();
        fetchStats();
        alert('Jogo cadastrado com sucesso!');
    } catch (err) {
        alert('Erro de conexão ao cadastrar o jogo.');
    }
});

// 11. Deletar Jogo (DELETE Protegido)
async function deleteGame(id) {
    const token = localStorage.getItem('token');
    if (!token) return alert('Acesso não autorizado.');

    if (!confirm('Tem certeza de que deseja remover este jogo da sua lista?')) return;

    try {
        const res = await fetch(`${API_URL}/games/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.error || 'Erro ao remover jogo.');
        }

        fetchGames();
        fetchStats();
        alert('Jogo removido com sucesso!');
    } catch (err) {
        alert('Erro de conexão ao remover o jogo.');
    }
}

// 12. Controle de UX: bloqueia o campo de nota se o status mudar para "desejado"
if (gameStatusSelect && gameRatingInput) {
    gameStatusSelect.addEventListener('change', () => {
        if (gameStatusSelect.value === 'desejado') {
            gameRatingInput.value = '';
            gameRatingInput.disabled = true;
            gameRatingInput.placeholder = 'Nota desabilitada (Desejado)';
        } else {
            gameRatingInput.disabled = false;
            gameRatingInput.placeholder = 'Nota (0 a 10)';
        }
    });
}