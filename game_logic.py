import random
from typing import List, Dict, Any


class Player:
    """Represents a player in the card game."""
    
    def __init__(self, name: str, number: int = None):
        self.name = name
        self.number = number
    
    def to_dict(self) -> Dict[str, Any]:
        return {"name": self.name, "number": self.number}


class Match:
    """Represents a match between two teams."""
    
    def __init__(self, team1: List[Player], team2: List[Player]):
        self.team1 = team1
        self.team2 = team2
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "team1": [player.to_dict() for player in self.team1],
            "team2": [player.to_dict() for player in self.team2]
        }


class CardGameManager:
    """Manages the card game logic including player management and match generation."""
    
    SAMPLE_NAMES = [
        "Joris", "Rene", "Boudewijn", "JanB", "JanJ", "Koos", "Johan", 
        "Ronald", "Mart", "Frank", "Justin", "Jurgen", "Johnny", 
        "Willem", "Edwin", "Martijn"
    ]
    
    def __init__(self, max_players: int = 16):
        self.max_players = max_players
        self.players: List[Player] = []
    
    def add_player(self, name: str) -> bool:
        """Add a player to the game. Returns True if successful, False if at max capacity."""
        if len(self.players) >= self.max_players:
            return False
        
        player = Player(name)
        self.players.append(player)
        return True
    
    def remove_player(self, index: int) -> bool:
        """Remove a player by index. Returns True if successful."""
        if 0 <= index < len(self.players):
            self.players.pop(index)
            return True
        return False
    
    def clear_players(self) -> None:
        """Clear all players."""
        self.players.clear()
    
    def quick_fill_players(self) -> None:
        """Fill with all sample names."""
        self.clear_players()
        shuffled_names = self.SAMPLE_NAMES.copy()
        random.shuffle(shuffled_names)
        
        for name in shuffled_names:
            if len(self.players) >= self.max_players:
                break
            self.add_player(name)
    
    def assign_numbers(self) -> None:
        """Assign random numbers to all players."""
        if not self.players:
            return
        
        numbers = list(range(1, len(self.players) + 1))
        random.shuffle(numbers)
        
        for i, player in enumerate(self.players):
            player.number = numbers[i]
    
    def get_sorted_players_by_number(self) -> List[Player]:
        """Get players sorted by their assigned numbers."""
        return sorted(self.players, key=lambda p: p.number or 0)
    
    def get_court_count(self) -> int:
        """Determine number of courts based on player count."""
        return 3 if len(self.players) >= 12 else 2
    
    def generate_matches(self, rounds: int = 3) -> List[List[Match]]:
        """Generate match schedule for specified number of rounds."""
        if len(self.players) < 4:
            return []
        
        all_rounds = []
        court_count = self.get_court_count()
        
        for round_num in range(rounds):
            matches = []
            available_players = self.players.copy()
            
            # Add dummy player if odd number of players
            if len(available_players) % 2 != 0:
                dummy_player = Player("Dummy", "-")
                available_players.append(dummy_player)
            
            # Create matches for this round
            courts_used = 0
            while len(available_players) >= 4 and courts_used < court_count:
                # Randomly select 4 players
                team1_players = []
                team2_players = []
                
                for _ in range(2):
                    if available_players:
                        player = available_players.pop(random.randint(0, len(available_players) - 1))
                        team1_players.append(player)
                
                for _ in range(2):
                    if available_players:
                        player = available_players.pop(random.randint(0, len(available_players) - 1))
                        team2_players.append(player)
                
                if len(team1_players) == 2 and len(team2_players) == 2:
                    matches.append(Match(team1_players, team2_players))
                    courts_used += 1
            
            all_rounds.append(matches)
        
        return all_rounds
    
    def get_players_dict(self) -> List[Dict[str, Any]]:
        """Get all players as dictionaries."""
        return [player.to_dict() for player in self.players]
    
    def get_matches_dict(self, rounds: int = 3) -> List[List[Dict[str, Any]]]:
        """Get match schedule as dictionaries."""
        matches = self.generate_matches(rounds)
        return [[match.to_dict() for match in round_matches] for round_matches in matches]