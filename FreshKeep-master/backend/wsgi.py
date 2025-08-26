# wsgi.py
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load the correct .env file
project_home = str(Path(__file__).parent)
dotenv_path = os.path.join(project_home, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import app as application