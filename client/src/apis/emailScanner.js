const emailScanner = async (text) => {
    const body = JSON.stringify({ text });
  
    const response = await fetch("http://localhost:9009/emailScanner", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  
    const emailScannerResult = await response.text();
    return emailScannerResult;
  };
  
  export default emailScanner;
  