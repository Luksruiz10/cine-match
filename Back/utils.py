from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from scipy.sparse import hstack

spanish_stopwords = ["la", "el", "en", "y", "a", "de", "un", "una", "que", "es", "por", "con", "para"]  # o usá nltk

def build_combined_matrix(movies):
    overviews = [movie.get("overview", "") for movie in movies]

    # TF-IDF sobre descripción
    vectorizer = TfidfVectorizer(stop_words=spanish_stopwords)
    overview_matrix = vectorizer.fit_transform(overviews)

    # Géneros
    mlb = MultiLabelBinarizer()
    genres_matrix = mlb.fit_transform([movie["genre_ids"] for movie in movies])

    # Cast (si tenés cast en tu dataset)
    all_casts = [" ".join(actor["name"] for actor in movie.get("cast", [])) for movie in movies]
    cast_vectorizer = TfidfVectorizer()
    cast_matrix = cast_vectorizer.fit_transform(all_casts)

    # Combinar todo
    combined_matrix = hstack([overview_matrix, genres_matrix, cast_matrix]).tocsr()
    return combined_matrix