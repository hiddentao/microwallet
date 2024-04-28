export const truncate = (str: string, len = 10): string => {
  if (str.length <= len) {
    return str;
  }

  return `${str.substring(0, (len-2)/2)}..${str.substring(str.length-(len-2)/2)}`;
}