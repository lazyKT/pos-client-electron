window.onload = () => {
  const closeButton = document.getElementById("close-setting");
  const setIPButton = document.getElementById("set-ip");
  const setPrinterButton = document.getElementById("save-printer");

  const appConfig = {};

  const serverUrl = localStorage.getItem("serverUrl");
  const printerName = localStorage.getItem("printerName");
  if (serverUrl) {
    const ipAddrInput = document.getElementById("server-addr");
    const printerNameDOM = document.getElementById("printer");

    ipAddrInput.value = serverUrl;
    appConfig.serverURL = serverUrl;

    printerNameDOM.value = printerName ? printerName : "";
  }
  else {
    throw new Error ("Server Url not found in Local Storage");
  }


  closeButton.addEventListener("click", e => {
    window.api.send("close-setting");
  });


  setIPButton.addEventListener("click", e => {

    const ipAddr = document.getElementById("server-addr").value;
    // console.log(ipAddr, appConfig.serverURL);
    if (!ipAddr || ipAddr === "" || ipAddr === appConfig.serverURL)
      return

    localStorage.serverUrl = ipAddr;
  });


  setPrinterButton.addEventListener("click", e => {

    const printerName = document.getElementById("printer")?.value;
    if (!printerName || printerName === '')
      return;

    localStorage.setItem("printerName", printerName);
  });
}
