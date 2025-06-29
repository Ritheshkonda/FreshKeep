# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# --- NEW IMPORTS FOR GEMINI API ---
import google.generativeai as genai
# --- END NEW IMPORTS ---

# Load environment variables
load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

db = SQLAlchemy(app)

# --- Configure Gemini API ---
# Retrieve API key from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please get one from Google AI Studio.")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the generative model
# You can choose different models like 'gemini-pro-vision' for multimodal
model = genai.GenerativeModel('gemini-1.5-flash')
# --- END Gemini API Configuration ---

# --- FoodItem Model ---
class FoodItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    quantity = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(20), nullable=True)

    def __repr__(self):
        return f'<FoodItem {self.name} - {self.expiry_date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'expiry': self.expiry_date.isoformat(),
            'category': self.category,
            'quantity': self.quantity,
            'unit': self.unit
        }

# --- FoodItem API Endpoints ---

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name')
    expiry_str = data.get('expiry')

    if not name or not expiry_str:
        return jsonify({'error': 'Item name and expiry date are required'}), 400

    try:
        expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid expiry date format. Use YYYY-MM-DD'}), 400

    new_item = FoodItem(
        name=name,
        expiry_date=expiry_date,
        category=data.get('category'),
        quantity=data.get('quantity'),
        unit=data.get('unit')
    )

    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/api/items', methods=['GET'])
def get_items():
    items = FoodItem.query.order_by(FoodItem.expiry_date).all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = db.session.get(FoodItem, item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    return jsonify(item.to_dict()), 200

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = db.session.get(FoodItem, item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    data = request.get_json()

    item.name = data.get('name', item.name)
    expiry_str = data.get('expiry', item.expiry_date.isoformat())
    try:
        item.expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid expiry date format'}), 400

    item.category = data.get('category', item.category)
    item.quantity = data.get('quantity', item.quantity)
    item.unit = data.get('unit', item.unit)

    db.session.commit()
    return jsonify(item.to_dict()), 200

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = db.session.get(FoodItem, item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully'}), 204

@app.route('/api/items/nearing-expiry', methods=['GET'])
def get_nearing_expiry_items():
    days = request.args.get('days', type=int, default=7)
    today = datetime.now().date()
    expiry_threshold = today + timedelta(days=days)

    nearing_items = FoodItem.query.filter(
        FoodItem.expiry_date >= today,
        FoodItem.expiry_date <= expiry_threshold
    ).order_by(FoodItem.expiry_date).all()

    return jsonify([item.to_dict() for item in nearing_items])

# --- NEW: Recipe Generation Endpoint with LLM Integration ---
@app.route('/api/generate-recipe', methods=['POST'])
def generate_recipe():
    data = request.get_json()
    if not data or 'inventory_items' not in data:
        return jsonify({'error': 'No inventory items provided'}), 400

    inventory_items = data['inventory_items']
    if not inventory_items:
        return jsonify({
            'name': 'No Items Provided',
            'ingredients': 'No items in your inventory to generate a recipe.',
            'instructions': 'Please add some food items to your inventory first!'
        }), 200

    # Create a concise prompt for the LLM
    prompt = (
        f"Generate a creative and practical recipe using ONLY these ingredients from a home kitchen inventory: "
        f"{', '.join(inventory_items)}. "
        "Do not include ingredients not listed unless they are very common pantry staples (like salt, pepper, oil, water) and explicitly mention them as such. "
        "Provide the output in the following format:\n\n"
        "Recipe Name: [Your Recipe Name]\n"
        "Ingredients: [Comma-separated list of ALL ingredients, including pantry staples]\n"
        "Instructions: [Numbered steps for cooking, each step on a new line]"
    )

    try:
        # Make the API call to Gemini
        response = model.generate_content(prompt)
        raw_text = response.text.strip() # Get the generated text

        # --- Parse the LLM's response ---
        # This is crucial and might need adjustment based on LLM's actual output format
        recipe_name = "Generated Recipe"
        ingredients = "Could not parse ingredients."
        instructions = "Could not parse instructions."

        lines = raw_text.split('\n')
        for line in lines:
            if line.startswith("Recipe Name:"):
                recipe_name = line.replace("Recipe Name:", "").strip()
            elif line.startswith("Ingredients:"):
                ingredients = line.replace("Ingredients:", "").strip()
            elif line.startswith("Instructions:"):
                # Capture instructions starting from this line until the end or next heading
                instructions_start_index = lines.index(line)
                instructions_lines = lines[instructions_start_index+1:]
                # Filter out empty lines or lines that might be part of a new section if not careful
                instructions = "\n".join([s.strip() for s in instructions_lines if s.strip() and not s.strip().startswith(("Recipe Name:", "Ingredients:"))])

        return jsonify({
            'name': recipe_name,
            'ingredients': ingredients,
            'instructions': instructions
        }), 200

    except Exception as e:
        # Handle potential API errors (e.g., network issues, invalid API key, rate limits)
        print(f"Error calling Gemini API: {e}")
        return jsonify({
            'name': 'Recipe Generation Failed',
            'ingredients': 'Please try again later.',
            'instructions': f'An error occurred: {str(e)}'
        }), 500


# --- Database Initialization Command ---
@app.cli.command('create-db')
def create_db():
    """Creates database tables."""
    db.create_all()
    print("Database tables created!")

# --- Run the Flask app ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)