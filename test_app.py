import unittest
from unittest.mock import patch, MagicMock
import json
import uuid
from app import app, games


class TestFlaskApp(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Clear games dictionary to ensure clean state
        games.clear()
    
    def test_index_route(self):
        """Test the main index route."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Card Game', response.data)
    
    def test_get_players_empty(self):
        """Test getting players when none exist."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        response = self.app.get('/api/players')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['players'], [])
        self.assertEqual(data['count'], 0)
        self.assertEqual(data['max_players'], 16)
    
    def test_add_player(self):
        """Test adding a player."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        response = self.app.post('/api/players', 
                                json={'name': 'Test Player'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['players']), 1)
        self.assertEqual(data['players'][0]['name'], 'Test Player')
    
    def test_add_player_empty_name(self):
        """Test adding a player with empty name."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        response = self.app.post('/api/players', 
                                json={'name': ''})
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_quick_fill(self):
        """Test quick fill functionality."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        response = self.app.post('/api/players/quick-fill')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['count'], 16)  # All sample names
    
    def test_generate_cards_no_players(self):
        """Test generating cards with no players."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        response = self.app.post('/api/generate-cards')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_generate_matches_insufficient_players(self):
        """Test generating matches with insufficient players."""
        with self.app.session_transaction() as sess:
            sess['game_id'] = str(uuid.uuid4())  # Unique session ID
        
        # Add only 2 players
        self.app.post('/api/players', json={'name': 'Player 1'})
        self.app.post('/api/players', json={'name': 'Player 2'})
        
        response = self.app.post('/api/generate-matches')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)


if __name__ == '__main__':
    unittest.main()