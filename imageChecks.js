const calculateCompletion = (goal, progress) => {
    if (!goal || !progress) return 0;
    return Math.min((progress / goal) * 100, 100);
  };

  const calculateRemaining = (goal, progress) => {
    if (!goal || !progress) return 0;
    return goal - progress;
  };