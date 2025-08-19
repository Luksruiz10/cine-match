import requests
import json
import time
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def fetch_popular_movies(pages=25):  # 20 películas por página * 25 = 500
    all_movies = []
    for page in range(1, pages + 1):
        url = f"{TMDB_BASE_URL}/movie/popular?api_key={API_KEY}&language=es-ES&page={page}"
        print(f"Fetching page {page}...")
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            for movie in data.get("results", []):
                movie_id = movie["id"]

                # Fetch credits (cast & crew)
                credits_url = f"{TMDB_BASE_URL}/movie/{movie_id}/credits?api_key={API_KEY}&language=es-ES"
                response_credits = requests.get(credits_url)
                if response_credits.status_code == 200:
                    credits_data = response_credits.json()

                    # 🎭 Actores: lista de los primeros 10 con nombre y foto
                    cast_info = [
                        {
                            "name": actor["name"],
                            "profile_path": f"https://image.tmdb.org/t/p/w500{actor['profile_path']}" if actor.get("profile_path") else None
                        }
                        for actor in credits_data.get("cast", [])[:10]
                    ]

                    # 🎬 Directores: filtrar crew por job == "Director"
                    directors = [
                        {
                            "name": member["name"],
                            "profile_path": f"https://image.tmdb.org/t/p/w500{member['profile_path']}" if member.get("profile_path") else None
                        }
                        for member in credits_data.get("crew", [])
                        if member.get("job") == "Director"
                    ]

                    # 👇 Agregar al diccionario de la película
                    movie["cast"] = cast_info
                    movie["directors"] = directors
                else:
                    print(f"⚠️ Error fetching credits for movie ID {movie_id}: {response_credits.status_code}")
                    movie["cast"] = []
                    movie["directors"] = []

                all_movies.append(movie)
        else:
            print(f"Error fetching page {page}: {response.status_code}")
            break

        time.sleep(0.9)  # Delay para no saturar la API (3 requests/seg en plan free)
    return all_movies


def save_dataset(movies, filename="movies_dataset.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)
    print(f"Dataset guardado en {filename}")

if __name__ == "__main__":
    movies = fetch_popular_movies(pages=25)  # Cambiá a 50 para ~1000 películas
    save_dataset(movies)