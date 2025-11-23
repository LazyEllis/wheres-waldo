import { useState, useRef } from "react";
import { useQuery } from "./hooks/useQuery";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { listCharacters } from "./lib/GameService";
import styles from "./styles/App.module.css";
import photo from "./assets/mountain.jpg";

const App = () => {
  const [position, setPosition] = useState(null);
  const frameRef = useRef(null);

  const {
    data: characters,
    isLoading,
    error,
  } = useQuery({ queryFn: listCharacters });

  useOutsideClick(frameRef, () => setPosition(null));

  const handlePositionSelect = (e) => {
    const pageX = e.pageX - frameRef.current.offsetLeft;
    const pageY = e.pageY - frameRef.current.offsetTop;

    setPosition({ x: pageX, y: pageY });
  };

  const handleCharacterSelect = () => {
    setPosition(null);
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
          <div className={styles.character} key={character.id}>
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
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
          >
            {characters.map((character) => (
              <li key={character.id}>
                <button
                  className={styles.dropdownButton}
                  onClick={handleCharacterSelect}
                >
                  {character.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default App;
