import { useEffect, useState } from "react";
import Loader from "./Loader";
import StarRating from "./StarRating";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce(
    (acc, cur, i, arr) => (cur > 0 ? acc + cur / arr.length : acc + cur),
    0
  );
const API_key = "45170ebe";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  // ... existing code ...
  useEffect(
    function () {
      const timerId = setTimeout(() => setQuery(query), 500);
      return () => clearTimeout(timerId); // Cleanup function
    },
    [query]
  );
  // ... existing code ...

  useEffect(
    function () {
      const controller = new AbortController();
      setError("");

      query.length > 2 && setIsLoading(true);
      async function fetchData() {
        try {
          const data = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${API_key}&s=${query}`,
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
          setError("uh oh movie not found ");
        } finally {
          setIsLoading(false);
        }
        if (query.length < 3) {
          setError("");
          setMovies([]);
          return;
        }
      }
      handleMovieClose();
      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  function handleMovieListClick(id) {
    setSelectedId(id === selectedId ? null : id);
  }
  function handleMovieClose() {
    setSelectedId(null);
    // document.title = "UsePopcorn";
  }

  function handleWatchedMovies(newMovie) {
    setWatched((watched) => [...watched, newMovie]);
  }

  function handleDeleteWatchedMovies(id) {
    setWatched((watched) => watched.filter((wa) => wa.imdbID !== id));
  }
  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar setQuery={setQuery} query={query} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage err={error} />
          ) : (
            <MovieList
              movies={movies}
              handleMovieListClick={handleMovieListClick}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              id={selectedId}
              handleMovieClose={handleMovieClose}
              handleWatchedMovies={handleWatchedMovies}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                watched={watched}
                handleDelete={handleDeleteWatchedMovies}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar({ setQuery, query }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies.. Min 3 Characters"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0}</strong> results
    </p>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function ErrorMessage({ err }) {
  return (
    <p className="error">
      <span>❌</span> {err}
    </p>
  );
}

function MovieList({ movies, handleMovieListClick }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleMovieListClick={handleMovieListClick}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleMovieListClick }) {
  return (
    <li onClick={() => handleMovieListClick(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ handleMovieClose, id, handleWatchedMovies, watched }) {
  const [loading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState({});
  const [rating, setRating] = useState("");
  useEffect(() => {
    async function fetchDetails() {
      try {
        setIsLoading(true);

        const data = await fetch(
          `http://www.omdbapi.com/?apikey=${API_key}&i=${id}`
        );

        const res = await data.json();
        setMovies(res);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [id]);

  useEffect(
    function () {
      document.title = `Movie ${movies.Title}`;

      return function () {
        document.title = "usePopcorn";
      }; //Cleanup function
    },
    [movies.Title]
  );

  //Key Press Effect

  useEffect(
    function () {
      function KeyListner(e) {
        if (e.code === "Escape") {
          handleMovieClose();
        }
      }
      document.addEventListener("keydown", KeyListner);

      return function () {
        document.removeEventListener("keydown", KeyListner);
      };
    },
    [handleMovieClose]
  );

  const isWatched = watched.filter((movie) => movie.imdbID === id).length > 0;
  // console.log("watched Status : ", isWatched);

  const currentMovie = watched.filter((mov) => mov.imdbID === id);
  // console.log(" Selected  movie", currentMovie);

  function handleAdd() {
    setIsLoading(true);
    const newMovie = {
      imdbID: movies.imdbID,
      Poster: movies.Poster,
      Title: movies.Title,
      imdbRating: Number(movies.imdbRating),
      userRating: Number(rating),
      runtime:
        movies.Runtime === "N/A"
          ? Number(0)
          : Number(movies.Runtime.split(" ").at(0)),
    };
    handleWatchedMovies(newMovie);
    handleMovieClose();

    setIsLoading(false);
  }
  return loading ? (
    <Loader />
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleMovieClose}>
          &larr;
        </button>
        <img src={movies.Poster} alt={`Poster of ${movies.Title}`} />
        <div className="details-overview">
          <h2>{movies.Title}</h2>
          <p>
            {movies.Released} &bull; {movies.Runtime}
          </p>
          <p>{movies.Genre}</p>
          <p>
            <span>⭐️</span>
            {movies.imdbRating}
          </p>
        </div>
      </header>

      <section>
        {!isWatched ? (
          <>
            <div className="ratings">
              <StarRating maxRating={10} size={24} onSetRating={setRating} />
            </div>
            {rating && (
              <button className="btn-add" onClick={() => handleAdd()}>
                + Add to List
              </button>
            )}
          </>
        ) : (
          <>
            <div className="ratings">
              <StarRating
                maxRating={10}
                size={24}
                defaultRating={currentMovie[0].userRating}
                classname="disabled"
              />
            </div>
            <button className="btn-add" disabled>
              + Add to List
            </button>
          </>
        )}

        <p>
          <em>{movies.Plot}</em>
        </p>
        <p>Staring {movies.Actors}</p>
        <p>
          Directed by {movies.Director === "N/A" ? "UnKnown" : movies.Director}
        </p>
      </section>
    </div>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, handleDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, handleDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => handleDelete(movie.imdbID)}>
        X
      </button>
    </li>
  );
}
