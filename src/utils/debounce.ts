const debounce = <Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): ((...args: Params) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export default debounce;
