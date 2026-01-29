const pad = (number, digits = 2) => ("00" + number).slice(-digits);

export const formatDuration = (duration) => {
  const ms = duration % 1000;
  duration = (duration - ms) / 1000;
  const secs = duration % 60;
  duration = (duration - secs) / 60;
  const mins = duration % 60;

  return `${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
};
