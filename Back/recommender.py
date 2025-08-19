import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords
from sklearn.preprocessing import MultiLabelBinarizer
from scipy.sparse import hstack
from collections import Counter
from utils import build_combined_matrix  # si lo tenés como una función aparte

nltk.download('stopwords')
spanish_stopwords = stopwords.words('spanish')

with open("tmdb_genres.json", "r", encoding="utf-8") as f:
    genre_id_to_name = json.load(f)  # tipo: {"28": "Acción", ...}




def load_movies_dataset(filename="movies_dataset.json"):
    print(f"📦 Cargando dataset desde {filename}...")
    with open(filename, "r", encoding="utf-8") as f:
        dataset = json.load(f)
    print(f"✅ {len(dataset)} películas cargadas")
    return dataset

def get_recommendations(favorites, all_movies, top_n=10):
    # 🔥 Extraer overview (descripción) de todas las películas
    all_overviews = [movie.get("overview", "") for movie in all_movies]

    # 🧠 Vectorizar descripciones usando TF-IDF
    vectorizer = TfidfVectorizer(stop_words=spanish_stopwords)
    overview_matrix = vectorizer.fit_transform(all_overviews)

    # 🔥 Extraer genres de todas las películas
    mlb = MultiLabelBinarizer()
    genres_matrix = mlb.fit_transform([movie['genre_ids'] for movie in all_movies])    

    # 🔥 Extraer y vectorizar cast
    all_casts = [" ".join(actor["name"] for actor in movie["cast"]) for movie in all_movies]
    tfidf_cast = TfidfVectorizer()
    cast_matrix = tfidf_cast.fit_transform(all_casts)

    # 📦 Combinar matrices
    combined_matrix = hstack([overview_matrix, genres_matrix, cast_matrix]).tocsr()

    # 🎯 Vector promedio de las favoritas
    fav_ids = [fav['id'] for fav in favorites]
    fav_indices = [i for i, movie in enumerate(all_movies) if movie["id"] in fav_ids]
    if not fav_indices:
        print("⚠️ Ninguna favorita encontrada en el dataset.")
        return []

    print("🔗 Índices de favoritas en dataset:", fav_indices)

    user_profile = combined_matrix[fav_indices].mean(axis=0)
    user_profile = np.asarray(user_profile)

    # 📊 Calcular similitud
    similarity_scores = cosine_similarity(user_profile, combined_matrix).flatten()

    threshold = 0.4  # filtro opcional
    seen_ids = set()  # 👈 Para guardar los IDs procesados

    recommendations = []
    for i in np.argsort(-similarity_scores):
        movie = all_movies[i]
        if (
            movie["id"] not in fav_ids
            and similarity_scores[i] > threshold
            and movie["id"] not in seen_ids  # 👈 Evita duplicados
        ):
            recommendations.append((movie, similarity_scores[i]))
            seen_ids.add(movie["id"])  # Marca como procesado

    print(f"🎯 Recomendaciones únicas encontradas: {len(recommendations)}")

    # Mostrar títulos y IDs
    for i, (movie, score) in enumerate(recommendations[:top_n]):
        print(f"{i+1}. {movie['title']} (ID: {movie['id']}) - Similaridad: {score:.3f}")

    if not recommendations:
        print("⚠️ No hay suficientes recomendaciones. Devolviendo populares.")
        recommendations = [(movie, 0) for movie in all_movies[:top_n]]

    # 📦 Devolver top N recomendaciones
    top_recommendations = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "overview": movie["overview"],
            "poster_path": movie["poster_path"],
            "vote_average": movie["vote_average"]
        }
        for movie, score in recommendations[:top_n]
    ]

    return top_recommendations

def get_actor_recommendations(favorites, all_movies, top_n=10):
    print("🎯 Generando recomendaciones basadas en actores...")

    # 1️⃣ Obtener todos los actores de las películas favoritas
    favorite_actors = []
    for fav in favorites:
        movie = next((m for m in all_movies if m["id"] == fav["id"]), None)
        if movie and "cast" in movie:
            favorite_actors.extend(movie["cast"])

    if not favorite_actors:
        print("⚠️ No se encontraron actores en las favoritas.")
        return []

    print("👥 Actores favoritos encontrados:", [actor["name"] for actor in favorite_actors])

    # 2️⃣ Contar cuántas veces aparece cada actor en las favo ritas
    actor_counts = Counter(actor["name"] for actor in favorite_actors)
    print("📊 Ranking de actores favoritos:", actor_counts)

    # 3️⃣ Puntuar las películas según cuántos actores favoritos aparecen en ellas
    movie_scores = []
    fav_ids = {fav['id'] for fav in favorites}
    processed_movie_ids = set()  # Para evitar duplicados

    for movie in all_movies:
        if movie["id"] in fav_ids or movie["id"] in processed_movie_ids:
            continue  # Excluir favoritas y duplicados
        shared_actors = [
            actor for actor in movie.get("cast", [])
            if actor["name"] in actor_counts
        ]
        score = len(shared_actors)
        if score > 0:
            movie_scores.append((movie, score, shared_actors))
            processed_movie_ids.add(movie["id"])  # Marca la película como procesada

    # 4️⃣ Ordenar por número de actores favoritos compartidos (desc)
    movie_scores.sort(key=lambda x: x[1], reverse=True)

    # 🏆 Mostrar las películas y los actores que coincidieron
    for i, (movie, score, actors) in enumerate(movie_scores[:top_n]):
        print(f"{i+1}. {movie['title']} 🎬 ({score} actores favoritos)")
        for actor in actors:
            print(f"    - 👤 {actor['name']} 🖼️ https://image.tmdb.org/t/p/w500{actor['profile_path']}")

    # 5️⃣ Devolver las top N recomendaciones
    recommendations = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "overview": movie["overview"],
            "poster_path": movie["poster_path"],
            "vote_average": movie["vote_average"],
            "shared_actors": actors
        }
        for movie, score, actors in movie_scores[:top_n]
    ]

    print(f"✅ {len(recommendations)} recomendaciones generadas.")
    return recommendations

def get_genre_recommendations(favorites, all_movies, top_n=16, popularity_threshold=60):
    favorite_genres = []
    for fav in favorites:
        favorite_genres.extend(fav.get("genre_ids", []))

    if not favorite_genres:
        print("⚠️ No se encontraron géneros en favoritas.")
        return {}

    top_genres = [genre for genre, _ in Counter(favorite_genres).most_common(5)]
    print("🏆 Géneros favoritos (IDs):", top_genres)

    genre_recommendations = {}

    for genre_id in top_genres:
        genre_movies = [
            movie for movie in all_movies
            if (
                genre_id in movie.get("genre_ids", []) and
                movie["id"] not in [f["id"] for f in favorites] and
                movie.get("popularity", 0) > popularity_threshold
                and str(movie.get("original_language", "")).lower() == "en"
            )
        ]

        print(f"🔎 Género {genre_id}: {len(genre_movies)} películas populares encontradas.")

        unique_movies = {movie["id"]: movie for movie in genre_movies}.values()
        sorted_movies = sorted(unique_movies, key=lambda m: m.get("vote_average", 0), reverse=True)

        genre_name = genre_id_to_name.get(str(genre_id), f"Género {genre_id}")
        genre_recommendations[genre_name] = [
            {
                "id": m["id"],
                "title": m["title"],
                "overview": m["overview"],
                "poster_path": m["poster_path"],
                "vote_average": m["vote_average"],
                "popularity": m["popularity"]
            }
            for m in sorted_movies[:top_n]
        ]

    return genre_recommendations


def calculate_compatibility(movie_id, favorites, all_movies):
    fav_ids = [fav["id"] for fav in favorites]
    all_ids = [movie["id"] for movie in all_movies]

    fav_indices = [i for i, mid in enumerate(all_ids) if mid in fav_ids]
    target_index = next((i for i, mid in enumerate(all_ids) if mid == movie_id), None)

    if not fav_indices or target_index is None:
        return 0.0

    combined_matrix = build_combined_matrix(all_movies)

    # ✅ Convertir matrices sparse a arrays densos
    user_vector = combined_matrix[fav_indices].mean(axis=0)
    user_vector = np.asarray(user_vector).reshape(1, -1)

    target_vector = combined_matrix[target_index]
    target_vector = target_vector.toarray().reshape(1, -1)

    similarity = cosine_similarity(user_vector, target_vector)[0][0]
    return float(similarity)
