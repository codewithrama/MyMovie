import { useState, useEffect } from "react";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_key = "45170ebe";

  useEffect(
    function () {
      const controller = new AbortController();
      setError("");

      query.length > 2 && setIsLoading(true);
      async function fetchData() {
        try {
          const data = await fetch(
            `http://www.omdbapi.com/?apikey=${API_key}&s=${query}`,
            { signal: controller.signal }
          );

          if (!data.ok) {
            throw new Error("Something went wrong");
          }

          const res = await data.json();

          if (res.Response === "False") {
            throw new Error(res.Error);
          }

          setMovies(res.Search);
        } catch (err) {
          console.error(err.message);
          if (err.name === "AbortError") {
            setError("");
          } else {
            setError("uh oh movie not found ");
          }
        } finally {
          setIsLoading(false);
        }
        if (query.length < 3) {
          setError("");
          setMovies([]);
          return;
        }
      }
      // handleMovieClose();
      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
