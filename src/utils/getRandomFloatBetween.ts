const getRandomFloatBetween = (min: number, max: number, decimals: number) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
};
export default getRandomFloatBetween;
