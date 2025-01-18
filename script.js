document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...

  const noMorePlayersButton = document.getElementById("no-more-players");
  const tagsContainer = document.getElementById("tags-container");

  noMorePlayersButton.addEventListener("click", () => {
    alert("No more player names to input.");
  });

  function addTag(name) {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = name;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", () => {
      tagsContainer.removeChild(tag);
    });

    tag.appendChild(deleteButton);
    tagsContainer.appendChild(tag);
  }

  // Example usage:
  addTag("Player 1");
  addTag("Player 2");

  // ...existing code...
});
