const colorToHex = (color: number) => {
  const hexadecimal = color.toString(16);
  return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
};

const convertRGBtoHex = (color: number[]) => {
  return (
    "#" +
    colorToHex(Math.floor(color[0])) +
    colorToHex(Math.floor(color[1])) +
    colorToHex(Math.floor(color[2]))
  );
};

export default convertRGBtoHex;