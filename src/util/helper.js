export const generateSearchParams = (object) =>
  new URLSearchParams(object).toString();

export const formatError = (error) => {
  const errorMessage = error.message.toLowerCase();

  if (error.path && Array.isArray(error.path) && error.path.length === 1) {
    const errorPath = error.path[0]
      .toLowerCase()
      .replace(/(?<=[a-zA-Z])_(?=[a-zA-Z])/g, " ");
    return `on field ${errorPath}, ${errorMessage}`;
  } else {
    const errorArray = error.path[0].toLowerCase();
    const errorOPtion = String.fromCharCode(65 + error.path[1]).toLowerCase();
    return `on ${errorArray} option ${errorOPtion} ${errorMessage}`;
  }
};

export const escapeBackticks = (markdown) => markdown.replace(/`/g, "\\`");

export const unescapeBackticks = (escapedMarkdown) =>
  escapedMarkdown.replace(/\\`/g, "`");
