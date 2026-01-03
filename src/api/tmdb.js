const BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(path, { apiKey, params = {} } = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", apiKey);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.status_message || "TMDB error");
  return data;
}

// ===== Image URLs =====
export function posterUrl(path, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}
export function backdropUrl(path, size = "w1280") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}
export function profileUrl(path, size = "w185") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

// ===== Lists =====
export function getTrendingMovies({ apiKey, timeWindow = "day", page = 1 } = {}) {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { apiKey, params: { page } });
}
export function getPopularMovies({ apiKey, page = 1 } = {}) {
  return tmdbFetch(`/movie/popular`, { apiKey, params: { page } });
}
export function getUpcomingMovies({ apiKey, page = 1 } = {}) {
  return tmdbFetch(`/movie/upcoming`, { apiKey, params: { page } });
}

// ===== Search =====
export function searchMovies({ apiKey, query, page = 1 } = {}) {
  return tmdbFetch(`/search/movie`, { apiKey, params: { query, page } });
}
export function multiSearch({ apiKey, query, page = 1 } = {}) {
  return tmdbFetch(`/search/multi`, { apiKey, params: { query, page } });
}

// ===== Movie =====
export function getMovieDetails({ apiKey, id } = {}) {
  return tmdbFetch(`/movie/${id}`, { apiKey });
}
export function getMovieCredits({ apiKey, id } = {}) {
  return tmdbFetch(`/movie/${id}/credits`, { apiKey });
}
export function getMovieVideos({ apiKey, id } = {}) {
  return tmdbFetch(`/movie/${id}/videos`, { apiKey });
}
export function getSimilarMovies({ apiKey, id, page = 1 } = {}) {
  return tmdbFetch(`/movie/${id}/similar`, { apiKey, params: { page } });
}

// ===== TV =====
export function getTvDetails({ apiKey, id } = {}) {
  return tmdbFetch(`/tv/${id}`, { apiKey });
}
export function getTvCredits({ apiKey, id } = {}) {
  return tmdbFetch(`/tv/${id}/credits`, { apiKey });
}
export function getTvVideos({ apiKey, id } = {}) {
  return tmdbFetch(`/tv/${id}/videos`, { apiKey });
}
export function getSimilarTv({ apiKey, id, page = 1 } = {}) {
  return tmdbFetch(`/tv/${id}/similar`, { apiKey, params: { page } });
}

// ===== Person =====
export function getPersonDetails({ apiKey, id } = {}) {
  return tmdbFetch(`/person/${id}`, { apiKey });
}
export function getPersonCombinedCredits({ apiKey, id } = {}) {
  return tmdbFetch(`/person/${id}/combined_credits`, { apiKey });
}

export function getMovieWatchProviders({ apiKey, id } = {}) {
  return tmdbFetch(`/movie/${id}/watch/providers`, { apiKey });
}

export function getTvWatchProviders({ apiKey, id } = {}) {
  return tmdbFetch(`/tv/${id}/watch/providers`, { apiKey });
}

// ===== TV Seasons / Episodes =====
export function getTvSeasonDetails({ apiKey, id, seasonNumber } = {}) {
  return tmdbFetch(`/tv/${id}/season/${seasonNumber}`, { apiKey });
}


export function getMovieReviews({ apiKey, id, page = 1 } = {}) {
  return tmdbFetch(`/movie/${id}/reviews`, { apiKey, params: { page } });
}
export function getTvReviews({ apiKey, id, page = 1 } = {}) {
  return tmdbFetch(`/tv/${id}/reviews`, { apiKey, params: { page } });
}


export function getCollectionDetails({ apiKey, id } = {}) {
  return tmdbFetch(`/collection/${id}`, { apiKey });
}


export function getCompanyDetails({ apiKey, id } = {}) {
  return tmdbFetch(`/company/${id}`, { apiKey });
}
export function getCompanyMovies({ apiKey, id, page = 1 } = {}) {
  return tmdbFetch(`/company/${id}/movies`, { apiKey, params: { page } });
}





