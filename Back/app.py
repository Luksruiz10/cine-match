from flask import Flask, request, jsonify
from recommender import get_recommendations, load_movies_dataset, get_actor_recommendations, get_genre_recommendations, calculate_compatibility
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 📦 Cargar dataset una vez al iniciar
movies_dataset = load_movies_dataset("movies_dataset.json")
wgenre_names = load_movies_dataset("tmdb_genres.json")

@app.route("/")
def home():
    return jsonify({"message": "CineMatch Backend Running ✅"})

@app.route("/intro-movies")
def get_intro_movies():
    movies = movies_dataset
    # Filtrar solo las que tengan popularidad > 1000
    filtered = [m for m in movies if m.get("popularity", 0) > 25]
    filtered = [m for m in filtered if m.get("original_language", "") == "en"]
    
    # Ordenar de mayor a menor popularidad
    highlighted = sorted(filtered, key=lambda x: x.get("popularity", 0), reverse=True)

    return jsonify(highlighted)

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    favorites = data.get("favorites", [])

    if not favorites:
        return jsonify({"error": "No se recibieron películas favoritas"}), 400

    print("🎯 Favoritos recibidos del frontend:")
    print([f["title"] for f in favorites])

    # 🔥 Obtener recomendaciones
    recommendations = get_recommendations(favorites, movies_dataset)

    return jsonify({
        "message": "Recomendaciones generadas correctamente ✅",
        "recommendations": recommendations
    })

@app.route("/recommend-by-actors", methods=["POST"])
def recommend_by_actors():
    data = request.get_json()
    favorites = data.get("favorites", [])

    if not favorites:
        return jsonify({"error": "No se recibieron películas favoritas"}), 400

    print("🎯 Favoritos recibidos del frontend (para actores):")
    print([f["title"] for f in favorites])

    recommendations = get_actor_recommendations(favorites, movies_dataset)

    return jsonify({
        "message": "Recomendaciones por actores generadas correctamente ✅",
        "recommendations": recommendations
    })

@app.route("/upcoming", methods=["GET"])
def get_upcoming_movies():
    today = datetime.today().date()
    
    # 🎯 Filtrar solo películas futuras
    upcoming_movies = [
        movie for movie in movies_dataset
        if "release_date" in movie
        and movie["release_date"]
        and datetime.strptime(movie["release_date"], "%Y-%m-%d").date() > today
    ]

    # 🧹 Eliminar duplicados por id
    unique_movies = {}
    for movie in upcoming_movies:
        unique_movies[movie["id"]] = movie  # si hay duplicados, se sobreescriben

    # 📦 Convertir de nuevo a lista
    upcoming_movies_unique = list(unique_movies.values())

    # 📅 Ordenar por fecha de estreno
    upcoming_movies_unique.sort(key=lambda m: m["release_date"])

    # 🔝 Limitar a 10 destacados
    top_upcoming = upcoming_movies_unique[:20]

    return jsonify(top_upcoming)

@app.route("/recommend-by-genres", methods=["POST"])
def recommend_by_genres():
    data = request.get_json()
    favorites = data.get("favorites", [])

    if not favorites:
        return jsonify({"error": "No se recibieron películas favoritas"}), 400

    print("🎯 Favoritos recibidos del frontend (para géneros):")
    print([f["title"] for f in favorites])

    recommendations = get_genre_recommendations(favorites, movies_dataset)

    return jsonify({
        "message": "Recomendaciones por géneros generadas correctamente ✅",
        "recommendations": recommendations
    })

@app.route("/compatibility", methods=["POST"])
def compatibility():
    data = request.get_json()
    movie_id = data.get("movie_id")
    favorites = data.get("favorites", [])

    if not movie_id or not favorites:
        return jsonify({"compatibility": 0.0})

    score = calculate_compatibility(movie_id, favorites, movies_dataset)
    return jsonify({"compatibility": round(score, 3)})

if __name__ == "__main__":
    app.run(debug=True)