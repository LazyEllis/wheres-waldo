import { useState } from "react";
import { CircleX } from "lucide-react";
import { useQuery } from "../hooks/useQuery";
import { useMutation } from "../hooks/useMutation";
import { getScore, listPlayers, recordScore } from "../lib/GameService";
import { formatDuration } from "../lib/utils";
import styles from "../styles/GameOverDialog.module.css";
import Loader from "./Loader";

const GameOverDialog = ({ onRestart }) => {
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: score, ...scoreQuery } = useQuery({ queryFn: getScore });

  const {
    data: players,
    setData: setPlayers,
    ...playerQuery
  } = useQuery({
    queryFn: listPlayers,
  });

  const mutation = useMutation({
    mutationFn: recordScore,
    onSuccess: (data) => {
      setPlayers([data, ...players]);
      setIsSubmitted(true);
    },
  });

  const handleChange = (e) => setName(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name });
  };

  if (scoreQuery.isLoading || playerQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (scoreQuery.error || playerQuery.error) {
    return <div>{scoreQuery.error.message || playerQuery.error.message}</div>;
  }

  const isHighScore = players.length === 0 || players[0].score > score.time;

  return (
    <dialog className={styles.dialog} open>
      <div className={styles.backdrop}></div>

      <div className={styles.panelContainer}>
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            <h2 className={styles.dialogHeading}>Game Over</h2>
            <div className={styles.dialogContent}>
              <p className={styles.score}>
                {isHighScore ? "New High Score" : "Score"}:{" "}
                {formatDuration(score.time)}
              </p>
              {isHighScore && !isSubmitted && (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {mutation.error && (
                    <div className={styles.alert}>
                      <div className={styles.alertIcon}>
                        <CircleX size={20} />
                      </div>
                      <div>
                        {Array.isArray(mutation.error) ? (
                          <>
                            <p className={styles.errorHeading}>
                              {mutation.error.length === 1
                                ? "There is an error in your submission"
                                : `There are ${mutation.error.length} errors in your submission`}
                            </p>
                            <ul className={styles.errorList}>
                              {mutation.error.map((err, index) => (
                                <li key={index}>{err.msg}</li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <span className={styles.errorMessage}>
                            {mutation.error.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className={styles.label}>
                      Name
                    </label>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={name}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div>
                    <button className={styles.button}>
                      {mutation.isLoading && <Loader />}{" "}
                      {mutation.isLoading ? "Saving..." : "Save Score"}
                    </button>
                  </div>
                </form>
              )}

              {(!isHighScore || isSubmitted) && (
                <div className={styles.container}>
                  <h3 className={styles.dialogHeading}>Leaderboard</h3>

                  <table className={styles.leaderboard}>
                    <thead>
                      <tr>
                        <th scope="col" className={styles.tableHeading}>
                          Name
                        </th>
                        <th scope="col" className={styles.tableHeading}>
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {players.map((player) => (
                        <tr key={player.id}>
                          <td className={styles.tableDetail}>{player.name}</td>
                          <td className={styles.tableDetail}>
                            {formatDuration(player.score)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button className={styles.button} onClick={onRestart}>
                    Restart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default GameOverDialog;
