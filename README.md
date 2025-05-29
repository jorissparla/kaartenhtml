# Card Game Application

A Python-based card game scheduling application built with Flask.

## Features

- **Player Management**: Add up to 16 players with a user-friendly interface
- **Quick Fill**: Automatically populate with predefined player names
- **Card Generation**: Assign random numbers to players and display as cards
- **Match Scheduling**: Generate 3 rounds of matches with automatic team formation
- **Court Management**: Automatically determine number of courts (2-3) based on player count
- **Responsive UI**: Modern interface built with TailwindCSS

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies (for TailwindCSS):
```bash
npm install
```

3. Build CSS (if making changes to styles):
```bash
npm run build
```

## Running the Application

Start the Flask development server:
```bash
python app.py
```

The application will be available at `http://127.0.0.1:5000`

## Testing

Run the test suite:
```bash
python -m unittest test_game_logic.py -v
python -m unittest test_app.py -v
```

## Project Structure

```
├── app.py                 # Main Flask application
├── game_logic.py          # Core game logic and classes
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── output.css     # Compiled TailwindCSS
│   └── js/
│       └── app.js         # Frontend JavaScript
├── test_game_logic.py     # Unit tests for game logic
├── test_app.py            # Unit tests for Flask routes
└── requirements.txt       # Python dependencies
```

## API Endpoints

- `GET /` - Main application page
- `GET /api/players` - Get all players
- `POST /api/players` - Add a new player
- `DELETE /api/players/<index>` - Remove a player
- `POST /api/players/quick-fill` - Fill with sample players
- `POST /api/players/clear` - Clear all players
- `POST /api/generate-cards` - Generate cards with random numbers
- `POST /api/generate-matches` - Generate match schedule

## Game Logic

The application generates matches using the following algorithm:

1. Players are randomly assigned numbers
2. For each round, players are randomly divided into teams of 2
3. Number of courts is determined by player count (2 courts for <12 players, 3 courts for >=12 players)
4. A dummy player is added if there's an odd number of players
5. Three rounds of matches are generated

## Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, JavaScript (Vanilla), TailwindCSS
- **Testing**: Python unittest
- **Build Tools**: Node.js, npm