export const isAlphaOnly = (string) => {
  return /^[a-zA-Z ]+$/.test(string);
}