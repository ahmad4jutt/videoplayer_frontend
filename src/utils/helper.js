export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const truncateText = (text, maxLength = 100) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
