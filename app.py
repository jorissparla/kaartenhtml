from flask import Flask, render_template, request, jsonify, session
import uuid
from game_logic import CardGameManager

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Store game instances per session
games = {}


def get_game():
    """Get or create a game instance for the current session."""
    if 'game_id' not in session:
        session['game_id'] = str(uuid.uuid4())
    
    game_id = session['game_id']
    if game_id not in games:
        games[game_id] = CardGameManager()
    
    return games[game_id]


@app.route('/')
def index():
    """Main page."""
    game = get_game()
    return render_template('index.html', 
                         players=game.get_players_dict(),
                         max_players=game.max_players,
                         sample_count=len(game.SAMPLE_NAMES))


@app.route('/api/players', methods=['GET'])
def get_players():
    """Get all players."""
    game = get_game()
    return jsonify({
        'players': game.get_players_dict(),
        'count': len(game.players),
        'max_players': game.max_players
    })


@app.route('/api/players', methods=['POST'])
def add_player():
    """Add a new player."""
    game = get_game()
    data = request.get_json()
    name = data.get('name', '').strip()
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    if game.add_player(name):
        return jsonify({
            'success': True,
            'players': game.get_players_dict(),
            'count': len(game.players)
        })
    else:
        return jsonify({'error': 'Maximum players reached'}), 400


@app.route('/api/players/<int:index>', methods=['DELETE'])
def remove_player(index):
    """Remove a player by index."""
    game = get_game()
    
    if game.remove_player(index):
        return jsonify({
            'success': True,
            'players': game.get_players_dict(),
            'count': len(game.players)
        })
    else:
        return jsonify({'error': 'Invalid player index'}), 400


@app.route('/api/players/quick-fill', methods=['POST'])
def quick_fill():
    """Fill with all sample players."""
    game = get_game()
    game.quick_fill_players()
    
    return jsonify({
        'success': True,
        'players': game.get_players_dict(),
        'count': len(game.players)
    })


@app.route('/api/players/clear', methods=['POST'])
def clear_players():
    """Clear all players."""
    game = get_game()
    game.clear_players()
    
    return jsonify({
        'success': True,
        'players': [],
        'count': 0
    })


@app.route('/api/generate-cards', methods=['POST'])
def generate_cards():
    """Generate cards with random numbers for players."""
    game = get_game()
    
    if len(game.players) == 0:
        return jsonify({'error': 'No players added'}), 400
    
    game.assign_numbers()
    sorted_players = game.get_sorted_players_by_number()
    
    return jsonify({
        'success': True,
        'cards': [player.to_dict() for player in sorted_players]
    })


@app.route('/api/generate-matches', methods=['POST'])
def generate_matches():
    """Generate match schedule."""
    game = get_game()
    
    if len(game.players) < 4:
        return jsonify({'error': 'Need at least 4 players to generate matches'}), 400
    
    matches = game.get_matches_dict()
    
    return jsonify({
        'success': True,
        'matches': matches,
        'court_count': game.get_court_count()
    })


if __name__ == '__main__':
    app.run(debug=True)