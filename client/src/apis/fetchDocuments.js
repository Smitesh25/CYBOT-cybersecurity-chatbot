const fetchDocuments = async () => {
  const response = await fetch("http://localhost:5601/getDocuments", {
    mode: "cors",
  });

  if (!response.ok) {
    return [];
  }

  const documentList = await response.json();
  return documentList;
};

export default fetchDocuments;
