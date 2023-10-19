import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "c5cb591a";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  const [isRated, setIsRated] = useState(false);

  const { movies, isLoading, error } = useMovies(query);

  const handleSelectedId = (id) => {
    setSelectedId((seletedId) => (selectedId === id ? null : id));
    setIsRated(() => checkIsRated(id));
  };

  const handleCloseMovie = () => {
    setSelectedId(null);
  };

  const addWatchedMovie = (movie) => {
    setWatched((curWatched) => [...curWatched, movie]);
    // localStorage.setItem("watchedMovies", JSON.stringify([...watched, movie]));
  };

  const checkIsRated = (id) => {
    return watched.some((m) => {
      if (m.imdbID === id) {
        return true;
      }
    });
  };

  const deleteWatchedMovie = (id) => {
    return setWatched(watched.filter((m) => m.imdbID !== id));
  };

  return (
    <>
      <NarBar query={query} setQuery={setQuery}>
        <NumResults movies={movies} />
      </NarBar>
      <Main>
        {isLoading && <Loader />}
        {!isLoading && !error && (
          <Box
            element={
              <MovieList movies={movies} onSelectedMovie={handleSelectedId} />
            }
          />
        )}
        {error && <ErrorMessage message={error} />}
        <Box
          element={
            selectedId ? (
              <MovieDetail
                watched={watched}
                isRated={isRated}
                addWatchedMovie={addWatchedMovie}
                selectedId={selectedId}
                handleCloseMovie={handleCloseMovie}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  deleteWatchedMovie={deleteWatchedMovie}
                />
              </>
            )
          }
        />
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Test() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <>
      <StarRating syncRating={setMovieRating} />
      <p>You rated the movie {movieRating} stars</p>
    </>
  );
}

function NarBar({ children, query, setQuery }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <Search query={query} setQuery={setQuery} />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      ref={inputEl}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ element }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && element}
    </div>
  );
}

function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

function MovieDetail({
  selectedId,
  handleCloseMovie,
  addWatchedMovie,
  isRated,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [watchedMovieRating, setWatchMovieRating] = useState("");

  const countRef = useRef(0);

  useEffect(() => {
    if (watchedMovieRating) {
      countRef.current += 1;
    }
  }, [watchedMovieRating]);

  useEffect(() => {
    async function getMovieDetail() {
      setIsLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!movie.Title) return;
    document.title = `Movie | ${movie.Title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [movie.Title]);

  useKey("Escape", handleCloseMovie);

  const handleClick = (m) => {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title: m.Title,
      Year: m.Year,
      Poster: m.Poster,
      runtime: Number(m.Runtime.split(" ").at(0)),
      imdbRating: Number(m.imdbRating),
      userRating: watchedMovieRating,
      countClickOfRating: countRef.current,
    };
    addWatchedMovie(newWatchedMovie);
    handleCloseMovie();
  };

  const watchedMovieRate = watched.find(
    (m) => m.imdbID === selectedId
  )?.userRating;

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              onClick={() => handleCloseMovie(movie)}
              className="btn-back"
            >
              &larr;
            </button>

            <img src={movie.Poster} alt={`poster of ${movie.Title} movie`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released}&bull;{movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐️</span>
                {movie.imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isRated ? (
                <>
                  <p>Rate and Add to your Watched List</p>
                  <StarRating
                    syncRating={setWatchMovieRating}
                    max={10}
                    size={24}
                    defaultRating={null}
                  />
                  {watchedMovieRating && (
                    <button
                      onClick={() => handleClick(movie)}
                      className="btn-add"
                    >
                      Add to Watched List
                    </button>
                  )}
                </>
              ) : (
                <p>You have rated the movie {watchedMovieRate} ⭐️</p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
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

function WatchedBox({ children }) {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && children}
    </div>
  );
}

function WatchedSummary({ watched }) {
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
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, deleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          deleteWatchedMovie={deleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, deleteWatchedMovie }) {
  return (
    <li>
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
      <button
        onClick={() => deleteWatchedMovie(movie.imdbID)}
        className="btn-delete"
      >
        X
      </button>
    </li>
  );
}
