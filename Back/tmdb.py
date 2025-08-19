import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

def get_popular_movies():
    url = f"{BASE_URL}/movie/popular?api_key={API_KEY}&language=es-ES&page=1"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Solo devolver los datos necesarios
        return [
            {
                "id": movie["id"],
                "title": movie["title"],
                "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            }
            for movie in data["results"]
        ]
    else:
        print("Error al obtener películas populares:", response.status_code)
        return []