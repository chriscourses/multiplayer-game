const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

let yourPlayer
const frontendPlayers = {}

socket.on('connect', () => {
  console.log(socket.id)
})

let animation
socket.on('updatePlayers', (backendPlayers) => {
  for (const id in backendPlayers) {
    if (id === yourPlayer.id) return

    if (animation) animation.kill()

    animation = gsap.to(frontendPlayers[id], {
      duration: 0.1,
      x: backendPlayers[id].x,
      y: backendPlayers[id].y
    })
  }
})

// called on load and on update
socket.on('connectAndDisconnectPlayers', (backendPlayers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id]

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player({
        x: backendPlayer.x,
        y: backendPlayer.y,
        radius: 10,
        color: 'white',
        velocity: { x: 0, y: 0 },
        id
      })
    }

    // assign player to YOU
    if (socket.id === id) yourPlayer = frontendPlayers[id]
  }

  for (const id in frontendPlayers) {
    if (!backendPlayers[id]) {
      delete frontendPlayers[id]
    }
  }

  console.log('YOUR PLAYER:', yourPlayer)
})

// update players

setInterval(() => {
  if (yourPlayer) {
    socket.emit('move', {
      position: { x: yourPlayer.x, y: yourPlayer.y },
      id: yourPlayer.id
    })
  }
}, 30)

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendPlayers) {
    const frontendPlayer = frontendPlayers[id]
    frontendPlayer.update()
  }
}

const keys = {
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  }
}

addEventListener('keydown', (e) => {
  if (!yourPlayer) return

  switch (e.code) {
    case 'KeyA':
      // keys.a.pressed = true
      yourPlayer.velocity.x -= 1
      break
    case 'KeyD':
      yourPlayer.velocity.x += 1
      break
    case 'KeyS':
      yourPlayer.velocity.y += 1
      break
    case 'KeyW':
      yourPlayer.velocity.y -= 1
      break
  }
})

addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyW':
      keys.w.pressed = false
      break
  }
})
animate()
