class CardGameApp {
  constructor() {
    this.players = [];
    this.maxPlayers = 16;
    this.initializeEventListeners();
    this.loadPlayers();
  }

  initializeEventListeners() {
    // Player form submission
    document.getElementById('playerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addPlayer();
    });

    // Quick fill button
    document.getElementById('quickFill').addEventListener('click', () => {
      this.quickFill();
    });

    // Finish button
    document.getElementById('no-more-players').addEventListener('click', () => {
      this.finishPlayerEntry();
    });
  }

  async loadPlayers() {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      this.players = data.players;
      this.maxPlayers = data.max_players;
      this.updatePlayerTags();
    } catch (error) {
      console.error('Error loading players:', error);
    }
  }

  async addPlayer() {
    const input = document.getElementById('playerInput');
    const name = input.value.trim();

    if (!name) return;

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (data.success) {
        this.players = data.players;
        this.updatePlayerTags();
        input.value = '';

        if (this.players.length >= this.maxPlayers) {
          document.getElementById('playerForm').style.display = 'none';
        }
      } else {
        alert(data.error || 'Error adding player');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player');
    }
  }

  async removePlayer(index) {
    try {
      const response = await fetch(`/api/players/${index}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        this.players = data.players;
        this.updatePlayerTags();

        if (this.players.length === 0) {
          document.getElementById('playerForm').style.display = 'block';
        }
      } else {
        alert(data.error || 'Error removing player');
      }
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Error removing player');
    }
  }

  async quickFill() {
    try {
      const response = await fetch('/api/players/quick-fill', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        this.players = data.players;
        this.updatePlayerTags();
      } else {
        alert(data.error || 'Error quick filling players');
      }
    } catch (error) {
      console.error('Error quick filling players:', error);
      alert('Error quick filling players');
    }
  }

  async finishPlayerEntry() {
    document.getElementById('playerForm').style.display = 'none';

    if (this.players.length > 0) {
      await this.generateCards();
    }
  }

  async generateCards() {
    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        this.displayCards(data.cards);
        await this.generateMatches();
      } else {
        alert(data.error || 'Error generating cards');
      }
    } catch (error) {
      console.error('Error generating cards:', error);
      alert('Error generating cards');
    }
  }

  async generateMatches() {
    try {
      const response = await fetch('/api/generate-matches', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        this.displayMatches(data.matches);
      } else {
        alert(data.error || 'Error generating matches');
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      alert('Error generating matches');
    }
  }

  updatePlayerTags() {
    const tagsContainer = document.getElementById('playerTags');
    tagsContainer.innerHTML = this.players
      .map(
        (player, index) => `
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 group hover:bg-blue-200 transition-colors duration-200">
          ${player.name}
          <button onclick="app.removePlayer(${index})" class="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none group-hover:text-blue-700 transition-colors duration-200">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
      `
      )
      .join('');
  }

  displayCards(cards) {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = cards
      .map(
        (card) => `
        <div class="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
          <h3 class="text-xl font-bold mb-2">${card.name}</h3>
          <div class="text-3xl font-bold text-blue-500">${card.number}</div>
        </div>
      `
      )
      .join('');
  }

  displayMatches(rounds) {
    const roundsContainer = document.getElementById('roundsContainer');
    roundsContainer.innerHTML = rounds
      .map(
        (round, roundIndex) => `
        <div class="bg-slate-100 p-6 rounded-lg shadow-sm">
          <h3 class="text-xl font-bold mb-4 text-slate-800">Round ${roundIndex + 1}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${round
              .map(
                (match, i) => `
              <div class="bg-white p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div class="text-slate-600 text-sm font-semibold mb-3 border-b border-slate-200 pb-2">
                  Court ${i + 1}
                </div>
                <div class="flex items-center justify-between gap-4">
                  <div class="w-5/12">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="inline-flex items-center justify-center bg-blue-600 text-white w-6 h-6 rounded-full text-xs font-bold">${match.team1[0].number}</span>
                      <span class="text-slate-700 truncate">${match.team1[0].name}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center bg-blue-600 text-white w-6 h-6 rounded-full text-xs font-bold">${match.team1[1].number}</span>
                      <span class="text-slate-700 truncate">${match.team1[1].name}</span>
                    </div>
                  </div>
                  <div class="text-sm font-bold text-slate-400">VS</div>
                  <div class="w-5/12 text-right">
                    <div class="flex items-center gap-2 justify-end mb-2">
                      <span class="text-slate-700 truncate">${match.team2[0].name}</span>
                      <span class="inline-flex items-center justify-center bg-blue-600 text-white w-6 h-6 rounded-full text-xs font-bold">${match.team2[0].number}</span>
                    </div>
                    <div class="flex items-center gap-2 justify-end">
                      <span class="text-slate-700 truncate">${match.team2[1].name}</span>
                      <span class="inline-flex items-center justify-center bg-blue-600 text-white w-6 h-6 rounded-full text-xs font-bold">${match.team2[1].number}</span>
                    </div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
      )
      .join('');
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CardGameApp();
});