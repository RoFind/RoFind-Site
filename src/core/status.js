const updateOnlineStatus = () => {
  var status = document.getElementById('status')?.innerHTML = navigator.onLine ? 'online' : 'offline'
  status.innerHTML = navigator.onLine ? 'online' : 'offline'

}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

updateOnlineStatus()

// TODO: Check if device is online