const closeButton = document.getElementById("close-setting");
const setIPButton = document.getElementById("set-ip");

let appConfig

window.api.receive ("load-setting", config => {
  appConfig = config;
  const ipAddr = document.getElementById("server-addr");
  ipAddr.value = config.serverURL;
});




closeButton.addEventListener("click", e => {
  window.api.send("close-setting");
});


setIPButton.addEventListener("click", e => {

  const ipAddr = document.getElementById("server-addr").value;

  if (!ipAddr || ipAddr === "" || ipAddr === appConfig.serverURL)
    return

  window.api.send("set-ip", ipAddr);
});
