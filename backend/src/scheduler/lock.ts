let running = false;

export const tryAcquireSchedulerLock = (): boolean => {
  if (running) {
    return false;
  }

  running = true;
  return true;
};

export const releaseSchedulerLock = (): void => {
  running = false;
};
