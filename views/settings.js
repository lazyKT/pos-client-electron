const PRINT_MODE_PRODUCTION = 0;
const PRINT_MODE_TEST = 1;

const printerOptions = {
  name: "",
  mode: PRINT_MODE_PRODUCTION
}

window.onload = () => {
  const closeButton = document.getElementById("close-setting");
  const setIPButton = document.getElementById("set-ip");
  const setPrinterButton = document.getElementById("save-printer");

  const appConfig = {};

  const serverUrl = localStorage.getItem("serverUrl");
  const { name, mode } = JSON.parse(localStorage.getItem("printOptions"));

  const ipAddrInput = document.getElementById("server-addr");
  const printerNameDOM = document.getElementById("printer");
  const printMode = document.getElementById("print-mode");

  ipAddrInput.value = serverUrl ? serverUrl : "Can't Read Server Url from Local Storage";
  appConfig.serverURL = serverUrl;

  printerNameDOM.value = name ? name : "";
  if (mode === 1)
    printMode.setAttribute("checked", true);
  else if (mode === 0)
    printMode.removeAttribute("checked");



  setIPButton.addEventListener("click", e => {

    const ipAddr = document.getElementById("server-addr").value;
    console.log(ipAddr, appConfig.serverURL);
    if (!ipAddr || ipAddr === "")
      return

    localStorage.serverUrl = ipAddr;
  });


  setPrinterButton.addEventListener("click", e => {

    const printerName = document.getElementById("printer")?.value;
    const testPrintMode = document.getElementById("print-mode");
    console.log(printerOptions);

    printerOptions.name = printerName;
    printerOptions.mode = testPrintMode.checked ? PRINT_MODE_TEST : PRINT_MODE_PRODUCTION;
    console.log(printerOptions);
    localStorage.setItem("printOptions", JSON.stringify(printerOptions));
  });
}
