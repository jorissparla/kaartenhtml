import unittest
from game_logic import CardGameManager, Player, Match


class TestCardGameManager(unittest.TestCase):
    
    def setUp(self):
        self.game = CardGameManager()
    
    def test_add_player(self):
        """Test adding players."""
        result = self.game.add_player("Test Player")
        self.assertTrue(result)
        self.assertEqual(len(self.game.players), 1)
        self.assertEqual(self.game.players[0].name, "Test Player")
    
    def test_max_players(self):
        """Test maximum player limit."""
        # Add maximum players
        for i in range(16):
            self.assertTrue(self.game.add_player(f"Player {i}"))
        
        # Try to add one more
        self.assertFalse(self.game.add_player("Extra Player"))
        self.assertEqual(len(self.game.players), 16)
    
    def test_remove_player(self):
        """Test removing players."""
        self.game.add_player("Player 1")
        self.game.add_player("Player 2")
        
        result = self.game.remove_player(0)
        self.assertTrue(result)
        self.assertEqual(len(self.game.players), 1)
        self.assertEqual(self.game.players[0].name, "Player 2")
    
    def test_remove_invalid_player(self):
        """Test removing player with invalid index."""
        self.game.add_player("Player 1")
        
        result = self.game.remove_player(5)
        self.assertFalse(result)
        self.assertEqual(len(self.game.players), 1)
    
    def test_quick_fill(self):
        """Test quick fill functionality."""
        self.game.quick_fill_players()
        self.assertEqual(len(self.game.players), len(self.game.SAMPLE_NAMES))
        
        # Check that all sample names are present
        player_names = [player.name for player in self.game.players]
        for name in self.game.SAMPLE_NAMES:
            self.assertIn(name, player_names)
    
    def test_assign_numbers(self):
        """Test number assignment."""
        self.game.add_player("Player 1")
        self.game.add_player("Player 2")
        self.game.add_player("Player 3")
        
        self.game.assign_numbers()
        
        numbers = [player.number for player in self.game.players]
        self.assertEqual(sorted(numbers), [1, 2, 3])
    
    def test_court_count(self):
        """Test court count calculation."""
        # Less than 12 players
        for i in range(10):
            self.game.add_player(f"Player {i}")
        self.assertEqual(self.game.get_court_count(), 2)
        
        # 12 or more players
        for i in range(10, 14):
            self.game.add_player(f"Player {i}")
        self.assertEqual(self.game.get_court_count(), 3)
    
    def test_generate_matches(self):
        """Test match generation."""
        # Add 8 players for predictable testing
        for i in range(8):
            self.game.add_player(f"Player {i}")
            
        matches = self.game.generate_matches(rounds=1)
        
        self.assertEqual(len(matches), 1)  # 1 round
        self.assertEqual(len(matches[0]), 2)  # 2 matches per round (8 players = 2 courts)
        
        # Check that each match has 2 teams with 2 players each
        for match in matches[0]:
            self.assertEqual(len(match.team1), 2)
            self.assertEqual(len(match.team2), 2)
    
    def test_odd_players(self):
        """Test match generation with odd number of players."""
        # Add 5 players
        for i in range(5):
            self.game.add_player(f"Player {i}")
            
        matches = self.game.generate_matches(rounds=1)
        
        self.assertEqual(len(matches), 1)
        self.assertEqual(len(matches[0]), 1)  # Only 1 match possible with 5 players + dummy


class TestPlayer(unittest.TestCase):
    
    def test_player_creation(self):
        """Test player creation."""
        player = Player("Test Player", 5)
        self.assertEqual(player.name, "Test Player")
        self.assertEqual(player.number, 5)
    
    def test_player_to_dict(self):
        """Test player dictionary conversion."""
        player = Player("Test Player", 5)
        expected = {"name": "Test Player", "number": 5}
        self.assertEqual(player.to_dict(), expected)


class TestMatch(unittest.TestCase):
    
    def test_match_creation(self):
        """Test match creation."""
        team1 = [Player("P1", 1), Player("P2", 2)]
        team2 = [Player("P3", 3), Player("P4", 4)]
        match = Match(team1, team2)
        
        self.assertEqual(len(match.team1), 2)
        self.assertEqual(len(match.team2), 2)
    
    def test_match_to_dict(self):
        """Test match dictionary conversion."""
        team1 = [Player("P1", 1), Player("P2", 2)]
        team2 = [Player("P3", 3), Player("P4", 4)]
        match = Match(team1, team2)
        
        result = match.to_dict()
        self.assertIn("team1", result)
        self.assertIn("team2", result)
        self.assertEqual(len(result["team1"]), 2)
        self.assertEqual(len(result["team2"]), 2)


if __name__ == '__main__':
    unittest.main()