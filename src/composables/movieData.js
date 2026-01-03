import { ref } from "vue";

export function useMovie() {
  const movie = ref(null);
  
  const apiUrl = "https://api.themoviedb.org/3";
  // use the same env var name as the rest of the app
  const apikey = import.meta.env.VITE_TMDB_API_KEY;
  // debug: show whether the key is present (will be undefined in production build if not set)
  console.log("VITE_TMDB_API_KEY present:", Boolean(apikey));

  async function fetchMovieById(id) {
    const response = await fetch(`${apiUrl}/movie/${id}?api_key=${apikey}`);
    movie.value = await response.json();
  } 
  
  return {
    fetchMovieById,
    movie,
  };
}