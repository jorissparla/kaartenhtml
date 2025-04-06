document.addEventListener("DOMContentLoaded", () => {
  const noMorePlayersButton = document.getElementById("no-more-players");
  const tagsContainer = document.getElementById("tags-container");
  const playerNameInput = document.getElementById("player-name");
  const addPlayerButton = document.getElementById("add-player");

  const MAX_PLAYERS = 12;
  let playerCount = 0;

  // Initially disable the "No more players" button until we reach max players
  noMorePlayersButton.disabled = true;

  // Function to check if max players reached and update UI accordingly
  function checkMaxPlayers() {
    if (playerCount >= MAX_PLAYERS) {
      playerNameInput.disabled = true;
      addPlayerButton.disabled = true;
      noMorePlayersButton.disabled = false;
      playerNameInput.placeholder = "Maximum players reached";
    }
  }

  noMorePlayersButton.addEventListener("click", () => {
    alert("No more player names to input. Maximum of 12 players reached.");
  });

  addPlayerButton.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    if (playerName && playerCount < MAX_PLAYERS) {
      addTag(playerName);
      playerNameInput.value = ""; // Clear the input field
      playerNameInput.focus(); // Return focus to the input field
    }
  });

  playerNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const playerName = playerNameInput.value.trim();
      if (playerName && playerCount < MAX_PLAYERS) {
        addTag(playerName);
        playerNameInput.value = ""; // Clear the input field
      }
    }
  });

  function addTag(name) {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = name;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", () => {
      tagsContainer.removeChild(tag);
      playerCount--;

      // Re-enable input and add button if we're below max players
      if (playerCount < MAX_PLAYERS) {
        playerNameInput.disabled = false;
        addPlayerButton.disabled = false;
        noMorePlayersButton.disabled = true;
        playerNameInput.placeholder = "Enter player name";
      }
    });

    tag.appendChild(deleteButton);
    tagsContainer.appendChild(tag);

    playerCount++;
    checkMaxPlayers();
  }
});
