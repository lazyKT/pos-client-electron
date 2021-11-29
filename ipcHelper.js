/**
 handle ipc main events
**/


/**
# Remove EventListeners which are no longer required
**/
exports.removeEventListeners = function (eventListener, channels) {
  try {
    channels.forEach(
      channel => {
        const func = eventListener.listeners(channel)[0];
        if (func)  eventListener.removeListener(channel, func);
        console.log(`${channel} was removed :)`);
      }
    );
  }
  catch (error) {
    console.error(`Error removing Event Listener: ${eventListener}`, error);
  }
}
