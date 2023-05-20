const filterText = async (text) => {
  const body = JSON.stringify({ text });

  const response = await fetch("http://localhost:5601/filter-text", {
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const filteredText = await response.text();
  return filteredText;
};

export default filterText;
