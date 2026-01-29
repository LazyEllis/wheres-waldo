import { useState, useEffect, useRef } from "react";
import { MapPin, CircleX } from "lucide-react";
import { useQuery } from "./hooks/useQuery";
import { useMutation } from "./hooks/useMutation";
import { useOutsideClick } from "./hooks/useOutsideClick";
import {
  listCharacters,
  placeMarker,
  startTimer,
  stopTimer,
} from "./lib/GameService";
import { formatDuration } from "./lib/utils";
import GameOverDialog from "./components/GameOverDialog";
import styles from "./styles/App.module.css";
import photo from "./assets/mountain.jpg";

const App = () => {
  const [position, setPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [notification, setNotification] = useState("");
  const [counter, setCounter] = useState(0);
  const [timestamp, setTimestamp] = useState({ start: "", end: "" });
  const frameRef = useRef(null);
  const toastRef = useRef(null);

  const {
    data: characters,
    isLoading,
    error,
  } = useQuery({ queryFn: listCharacters });

  const { mutate } = useMutation({
    mutationFn: startTimer,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setTimestamp({ start: Date.now(), end: "" });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: stopTimer,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setTimestamp({ ...timestamp, end: Date.now() });
      setMarkers([]);
    },
  });

  const markerMutation = useMutation({
    mutationFn: placeMarker,
    onSuccess: (data) => {
      if (data.found && !markers.some((marker) => marker.id === data.id)) {
        const updatedMarkers = [
          ...markers,
          { id: data.id, coordinate: position.page },
        ];
        setMarkers(updatedMarkers);

        if (updatedMarkers.length === characters.length)
          stopTimerMutation.mutate();
      } else {
        setNotification(data.message);
      }

      setPosition(null);
    },
  });

  useEffect(() => {
    if (characters) {
      mutate();
    }
  }, [characters, mutate]);

  useEffect(() => {
    if (timestamp.start && !timestamp.end) {
      const key = setInterval(() => {
        setCounter(Date.now() - timestamp.start);
      }, 10);

      return () => {
        clearInterval(key);
      };
    }
  }, [timestamp.start, timestamp.end]);

  useOutsideClick(frameRef, () => setPosition(null));

  useOutsideClick(toastRef, () => setNotification(""));

  const handlePositionSelect = (e) => {
    const image = e.target;
    const rect = image.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const ratioX = image.naturalWidth / image.offsetWidth;
    const ratioY = image.naturalHeight / image.offsetHeight;

    const positionX = Math.floor(ratioX * mouseX);
    const positionY = Math.floor(ratioY * mouseY);

    setPosition({
      page: { x: mouseX, y: mouseY },
      normalized: { x: positionX, y: positionY },
    });
  };

  const handleCharacterSelect = (id) => {
    markerMutation.mutate({ id, coordinate: position.normalized });
  };

  const handleRestart = () => {
    mutate();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className="sr-only">Where's Waldo</h1>
        <div className={styles.characterList}>
          {characters.map((character) => (
            <div
              className={`${styles.character} ${markers.some((marker) => marker.id === character.id) ? styles.found : null}`}
              key={character.id}
            >
              <img src={character.image} alt="" className={styles.icons} />
              <div>{character.name}</div>
            </div>
          ))}
        </div>
        <div className={styles.timer}>{formatDuration(counter)}</div>
      </header>
      <main className={styles.frame} ref={frameRef}>
        <img
          src={photo}
          alt="Illustration of a mountain"
          className={styles.image}
          onClick={handlePositionSelect}
        />
        {position && (
          <ul
            className={styles.dropdownItems}
            style={{
              left: `${position.page.x}px`,
              top: `${position.page.y}px`,
            }}
          >
            {characters.map((character) => (
              <li key={character.id}>
                <button
                  className={styles.dropdownButton}
                  onClick={() => handleCharacterSelect(character.id)}
                >
                  {character.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {markers.map((marker) => (
          <div
            className={styles.markerContainer}
            key={marker.id}
            style={{
              left: `${marker.coordinate.x}px`,
              top: `${marker.coordinate.y}px`,
            }}
          >
            <MapPin className={styles.marker} />
          </div>
        ))}
        {notification && (
          <div className={styles.toast} ref={toastRef}>
            <CircleX className={styles.toastIcon} />
            <div className={styles.toastMessage}>{notification}</div>
          </div>
        )}

        {timestamp.end && <GameOverDialog onRestart={handleRestart} />}
      </main>
    </>
  );
};

export default App;
