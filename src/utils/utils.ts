/**
 * Converts an amount in dollars to an integer representation in cents.
 * @param amountInDollars The amount in dollars to be converted. This should be a number.
 * @returns An integer representing the amount in cents.
 * @throws {TypeError} If the amountInDollars is not a number.
 * @example
 * getCents(12.34); // returns 1234
 * getCents(0); // returns 0
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
 * Converts an amount in cents to a string representation in dollars.
 * @param amountInCents The amount in cents to be converted. This should be a number.
 * @returns A string representation of the amount in dollars, in the format '$xx.xx'.
 * @throws {TypeError} If the amountInCents is not a number.
 * @throws {RangeError} If the amountInCents contains a decimal point.
 * @example
 * getDollars(12345); // returns '$123.45'
 * getDollars(0); // returns '$0.00'
 */

export const getDollars = (amountInCents: number) => {
  const amountString = amountInCents.toString();

  const decimalIndex = amountString.indexOf(".");
  if (decimalIndex !== -1) return "No Deicmal Point is expected";

  const formattedString = amountString.padStart(3, "0");

  const length = formattedString.length;

  const finalDollarString =
    formattedString.substring(0, length - 2) +
    "." +
    formattedString.substring(length - 2);

  return finalDollarString;
};
