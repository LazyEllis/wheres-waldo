import { useState, useRef } from "react";
import { MapPin, CircleX } from "lucide-react";
import { useQuery } from "./hooks/useQuery";
import { useMutation } from "./hooks/useMutation";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { listCharacters, placeMarker } from "./lib/GameService";
import styles from "./styles/App.module.css";
import photo from "./assets/mountain.jpg";

const App = () => {
  const [position, setPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [notification, setNotification] = useState("");
  const frameRef = useRef(null);
  const toastRef = useRef(null);

  const {
    data: characters,
    isLoading,
    error,
  } = useQuery({ queryFn: listCharacters });

  const mutation = useMutation({
    mutationFn: placeMarker,
    onSuccess: (data) => {
      if (data.found && !markers.some((marker) => marker.id === data.id)) {
        setMarkers([...markers, { id: data.id, coordinate: position.page }]);
      } else {
        setNotification(data.message);
      }

      setPosition(null);
    },
  });

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
    mutation.mutate({ id, coordinate: position.normalized });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
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
      <div className={styles.frame} ref={frameRef}>
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
      </div>
    </>
  );
};

export default App;
