const antiSpamClick = <Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): ((...args: Params) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isAlreadyExecuted = false;
  return (...args: Params) => {
    if (!isAlreadyExecuted) {
      isAlreadyExecuted = true;
      func(...args);
    } else {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        isAlreadyExecuted = false;
      }, timeout);
    }
  };
};

export default antiSpamClick;
