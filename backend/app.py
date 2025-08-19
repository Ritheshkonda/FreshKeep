from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# --- MongoDB Imports ---
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
# --- End MongoDB Imports ---

# --- Gemini API Imports ---
import google.generativeai as genai
# --- End Gemini API Imports ---

# Load environment variables
load_dotenv()

app = Flask(__name__)

# --- MongoDB Configuration ---
# Use the DATABASE_URL environment variable for connection
app.config['MONGO_URI'] = os.getenv('DATABASE_URL')
mongo = PyMongo(app)
# --- End MongoDB Configuration ---

CORS(app)

# --- Configure Gemini API ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please get one from Google AI Studio.")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
# --- END Gemini API Configuration ---


# --- API Endpoints ---

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
        # Use datetime object directly, without converting to .date()
        expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid expiry date format. Use YYYY-MM-DD'}), 400

    new_item = {
        'name': name,
        'expiry_date': expiry_date,
        'category': data.get('category'),
        'quantity': data.get('quantity'),
        'unit': data.get('unit')
    }

    # Insert document into the 'food_item' collection
    result = mongo.db.food_item.insert_one(new_item)
    
    # Prepare the response
    response_item = {
        'id': str(result.inserted_id),
        '_id': str(result.inserted_id),
        'name': name,
        'expiry': expiry_date.strftime('%Y-%m-%d'),
        'category': data.get('category'),
        'quantity': data.get('quantity'),
        'unit': data.get('unit')
    }
    
    return jsonify(response_item), 201

@app.route('/api/items', methods=['GET'])
def get_items():
    # Find all documents in 'food_item' collection
    items = list(mongo.db.food_item.find().sort('expiry_date', 1))
    
    # Convert ObjectId and datetime to string for JSON serialization
    for item in items:
        item['_id'] = str(item['_id'])
        item['id'] = item['_id']
        if isinstance(item.get('expiry_date'), datetime):
             item['expiry'] = item['expiry_date'].strftime('%Y-%m-%d')
        del item['expiry_date']

    return jsonify(items), 200

@app.route('/api/items/<item_id>', methods=['GET'])
def get_item(item_id):
    try:
        # Find one document by its ObjectId
        item = mongo.db.food_item.find_one({'_id': ObjectId(item_id)})
    except:
        return jsonify({'message': 'Invalid item ID format'}), 400

    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    # Convert ObjectId and datetime to string for JSON serialization
    item['_id'] = str(item['_id'])
    item['id'] = item['_id']
    if isinstance(item.get('expiry_date'), datetime):
        item['expiry'] = item['expiry_date'].strftime('%Y-%m-%d')
    del item['expiry_date']

    return jsonify(item), 200

@app.route('/api/items/<item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    try:
        item_id_obj = ObjectId(item_id)
        update_data = {key: value for key, value in data.items() if key != 'id'}
        
        if 'expiry' in update_data:
            # Use datetime object directly, without converting to .date()
            update_data['expiry_date'] = datetime.strptime(update_data['expiry'], '%Y-%m-%d')
            del update_data['expiry']
        
        result = mongo.db.food_item.update_one(
            {'_id': item_id_obj},
            {'$set': update_data}
        )
    except:
        return jsonify({'message': 'Invalid item ID format'}), 400

    if result.matched_count == 0:
        return jsonify({'message': 'Item not found'}), 404

    # Fetch the updated item to return it
    updated_item = mongo.db.food_item.find_one({'_id': item_id_obj})
    updated_item['_id'] = str(updated_item['_id'])
    updated_item['id'] = updated_item['_id']
    if isinstance(updated_item.get('expiry_date'), datetime):
        updated_item['expiry'] = updated_item['expiry_date'].strftime('%Y-%m-%d')
    del updated_item['expiry_date']

    return jsonify(updated_item), 200

@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        # Delete one document by ObjectId
        result = mongo.db.food_item.delete_one({'_id': ObjectId(item_id)})
    except:
        return jsonify({'message': 'Invalid item ID format'}), 400

    if result.deleted_count == 0:
        return jsonify({'message': 'Item not found'}), 404

    return jsonify({'message': 'Item deleted successfully'}), 204

@app.route('/api/items/nearing-expiry', methods=['GET'])
def get_nearing_expiry_items():
    days = request.args.get('days', type=int, default=7)
    # Use datetime objects for comparison
    today = datetime.now()
    expiry_threshold = today + timedelta(days=days)

    # Find documents where expiry_date is within the threshold
    items = list(mongo.db.food_item.find({
        'expiry_date': {'$gte': today, '$lte': expiry_threshold}
    }).sort('expiry_date', 1))

    for item in items:
        item['_id'] = str(item['_id'])
        item['id'] = item['_id']
        if isinstance(item.get('expiry_date'), datetime):
            item['expiry'] = item['expiry_date'].strftime('%Y-%m-%d')
        del item['expiry_date']

    return jsonify(items)

# --- Recipe Generation Endpoint with LLM Integration ---
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
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

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
                instructions_start_index = lines.index(line)
                instructions_lines = lines[instructions_start_index+1:]
                instructions = "\n".join([s.strip() for s in instructions_lines if s.strip() and not s.strip().startswith(("Recipe Name:", "Ingredients:"))])

        return jsonify({
            'name': recipe_name,
            'ingredients': ingredients,
            'instructions': instructions
        }), 200

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({
            'name': 'Recipe Generation Failed',
            'ingredients': 'Please try again later.',
            'instructions': f'An error occurred: {str(e)}'
        }), 500


# --- Run the Flask app ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)