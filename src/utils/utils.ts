/**
 * Converts the amount to cents using conversion rate as 1$ = 100 cents (uses rounding)
 * @param amountInDollars The amount to be converted in cents
 * @returns Returns the converted amount in cents
 */
export const getCents = (amountInDollars: number) => {
  const numString = amountInDollars.toString();
  const decimalIndex = numString.indexOf(".");

  //the number has no decimal point
  if (decimalIndex === -1) return amountInDollars * 100;

  const length = numString.length;
  var formattedNumString = numString;

  if (length - 2 === decimalIndex) {
    formattedNumString = numString.concat("0");
  }

  const finalAmount =
    formattedNumString.substring(0, decimalIndex) +
    formattedNumString.substring(decimalIndex + 1, decimalIndex + 3);

  return parseInt(finalAmount, 10);
};

/**
 * Converts the given cents into dollars and returns it as a string (eg. for input 243 gives 2.43)
 * @param amountInCents The amount in cents that is to be converted to dollars
 * @returns The converted dollars in STRING with 2 decimal places
 */
export const getDollars = (amountInCents: number) => {
  const amountString = amountInCents.toString();

  const decimalIndex = amountString.indexOf(".");
  if (decimalIndex !== -1) return "No Deicmal Point is expexcted";

  const formattedString = amountString.padStart(3, "0");

  const length = formattedString.length;

  const finalDollarString =
    formattedString.substring(0, length - 2) +
    "." +
    formattedString.substring(length - 2);

  return finalDollarString;
};
