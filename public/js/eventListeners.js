addEventListener('click', (event) => {
  const canvas = document.querySelector('canvas')
  const { top, left } = canvas.getBoundingClientRect()
  // If error is shown then it is for the first time when clicked on the username input box
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  }

  const angle = Math.atan2(
    event.clientY - top - playerPosition.y,
    event.clientX - left - playerPosition.x
  )


  socket.emit('shoot', {
    x: playerPosition.x,
    y: playerPosition.y,
    angle
  })
})
