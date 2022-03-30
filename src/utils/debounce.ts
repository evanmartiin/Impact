// const debounce = (func: (args: any[]) => any, wait = 200) => {
//   let timeout: any;

//   return (...args: any) => {
//     const later = () => {
//       clearTimeout(timeout);
//       func(args);
//     };

//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

const debounce = <Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): ((...args: Params) => void) => {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export default debounce;
