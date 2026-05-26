from flask import Flask, jsonify
from flask_cors import CORS
import json, os

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), "lignes_ddd.json")

def charger_lignes():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>"]
    })

@app.route("/lignes", methods=["GET"])
def get_lignes():
    return jsonify(charger_lignes())

@app.route("/lignes/<int:ligne_id>", methods=["GET"])
def get_ligne(ligne_id):
    ligne = next((l for l in charger_lignes() if l["id"] == ligne_id), None)
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)

if __name__ == "__main__":
    app.run(debug=True, port=5000)