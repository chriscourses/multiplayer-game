const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
const frontEndProjectiles = {}
const frontEndPortions = {}



socket.on('updateProjectiles', (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: backEndProjectile.radius,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      })
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId]
    }
  }
})

socket.on('updatePortions', (backEndPortions) => {
  for (const id in backEndPortions) {
    const backEndPortion = backEndPortions[id]

    if (!frontEndPortions[id]) {
      frontEndPortions[id] = new Portion({
        x: backEndPortion.x,
        y: backEndPortion.y,
        effect: backEndPortion.effect
      })
    }

  }

  for (const id in frontEndPortions) {
    if (!backEndPortions[id]) {
      if (!backEndPortions[id]) {
        delete frontEndPortions[id]
      }
    }
  }
})

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (frontEndPlayers[id]) {
      frontEndPlayers[id].radius = backEndPlayer.radius
      frontEndPlayers[id].updateEffect(backEndPlayer.effect, backEndPlayer.effectTime)
      frontEndPlayers[id].speed = backEndPlayer.speed
      frontEndPlayers[id].projectileRadius = backEndPlayer.projectileRadius
      frontEndPlayers[id].projectileSpeed = backEndPlayer.projectileSpeed,
      frontEndPlayers[id].health = backEndPlayer.health,
      frontEndPlayers[id].healthBar = backEndPlayer.healthBar,
      frontEndPlayers[id].projectileDamage = backEndPlayer.projectileDamage
    }


    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: backEndPlayer.radius,
        color: backEndPlayer.color,
        speed: backEndPlayer.speed,
        projectileRadius: backEndPlayer.projectileRadius,
        projectileSpeed: backEndPlayer.projectileSpeed,
        username: backEndPlayer.username,
        health: backEndPlayer.health,
        healthBar: backEndPlayer.healthBar,
        projectileDamage: backEndPlayer.projectileDamage,
      })



      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backEndPlayer.score)

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      // removes old elements
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // adds sorted elements
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id === socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    frontEndPlayer.draw()
  }

  for (const id in frontEndPortions) {
    const frontEndPortion = frontEndPortions[id]
    frontEndPortion.draw()
  }

  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  // for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
  //   const frontEndProjectile = frontEndProjectiles[i]
  //   frontEndProjectile.update()
  // }
}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}


const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  // Used to detect the key presses
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -frontEndPlayers[socket.id].speed })
    //frontEndPlayers[socket.id].y -= frontEndPlayers[socket.id].speed

    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -frontEndPlayers[socket.id].speed, dy: 0 })
    //frontEndPlayers[socket.id].x -= frontEndPlayers[socket.id].speed

    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: frontEndPlayers[socket.id].speed })
    //frontEndPlayers[socket.id].y += frontEndPlayers[socket.id].speed

    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: frontEndPlayers[socket.id].speed, dy: 0 })
    //frontEndPlayers[socket.id].x += frontEndPlayers[socket.id].speed

    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }

  // Use to the portions effect to the client
  try{
    if (frontEndPlayers[socket.id].effect) {
      const portionDiv = document.querySelector('#portionEffects')
      if (frontEndPlayers[socket.id].effectTime < 500) {
        portionDiv.innerHTML = ''
      }
      else {
        portionDiv.innerHTML = `<div data-id="${socket.id}">${frontEndPlayers[socket.id].effect}: ${frontEndPlayers[socket.id].effectTime}</div>`
      }
  
    }
  }
  catch(error){}
  
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})

document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault()
  document.querySelector('#usernameForm').style.display = 'none'
  socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector('#usernameInput').value
  })
})
