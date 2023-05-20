const removeFile = async () => {
  const response = await fetch("http://localhost:5601/removeFile", {
    mode: "cors",
    method: "POST",
  });

  return response;
};

export default removeFile;
