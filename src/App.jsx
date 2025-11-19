import { useState, useRef } from "react";
import { useOutsideClick } from "./hooks/useOutsideClick";
import styles from "./styles/App.module.css";
import photo from "./assets/mountain.jpg";

const App = () => {
  const [position, setPosition] = useState(null);
  const frameRef = useRef(null);

  useOutsideClick(frameRef, () => setPosition(null));

  const handlePositionSelect = (e) => {
    setPosition({ x: e.pageX, y: e.pageY });
  };

  const handleCharacterSelect = () => {
    setPosition(null);
  };

  return (
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
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >
          <li>
            <button
              className={styles.dropdownButton}
              onClick={handleCharacterSelect}
            >
              Action
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default App;
