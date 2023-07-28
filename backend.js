const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}
const backEndProjectiles = {}
const backEndPortions = {}

const SPEED = 10
const RADIUS = 20
const PROJECTILE_RADIUS = 5
const PROJECTILE_SPEED = 50
const PORTION_SPWAN_TIME = 1000
const EFFECT_TIME = 10000
//const EFFECTS = ['GROW', 'FLASH', 'BIG_BULLETS', 'SHINK', 'FAST_BULLETS', 'SLOW_BULLETS']
const EFFECTS = ['GROW', 'SHINK']
let projectileId = 0
let count = 0


io.on('connection', (socket) => {
  console.log('a user connected')

  io.emit('updatePlayers', backEndPlayers)

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * PROJECTILE_SPEED,
      y: Math.sin(angle) * PROJECTILE_SPEED
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
      radius:PROJECTILE_RADIUS
    }

    //console.log(backEndProjectiles)
  })

  socket.on('initGame', ({ username, width, height, devicePixelRatio }) => {
    backEndPlayers[socket.id] = {
      x: 500 * Math.random()+500,
      y: 500 * Math.random()+500,
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      radius:RADIUS,
      effect:'',
      effectTime:-1,
      username,
    }

    // where we init our canvas
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }

    backEndPlayers[socket.id].radius = RADIUS

    if (devicePixelRatio > 1) {
      backEndPlayers[socket.id].radius = 2 * RADIUS
    }
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED
        break

      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED
        break

      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED
        break

      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED
        break
    }
  })
})


// backend ticker
setInterval((radius=PROJECTILE_RADIUS) => {
  if (count == PORTION_SPWAN_TIME){
    backEndPortions[1000*Math.random()] = {
      x: 500 * Math.random(),
      y: 500 * Math.random(),
      effect:EFFECTS[(Math.floor(Math.random() * EFFECTS.length))]
    }
    console.log(backEndPortions)
    count = 0
  }
  count++
  

  // Collision of player with portions
  for (const playerId in backEndPlayers){
    const backEndPlayer = backEndPlayers[playerId]

    if (backEndPlayer.effectTime > 0){
      backEndPlayer.effectTime -= 15
    }

    if (backEndPlayer.effectTime < 0){
      backEndPlayer.effectTime = -1
      if(backEndPlayer.effect == 'GROW'){
        backEndPlayer.radius = 20
        backEndPlayer.effect = ''
      }
      if(backEndPlayer.effect == 'SHINK'){
        backEndPlayer.radius = 20
        backEndPlayer.effect = ''
      }
    }

    for (const id in backEndPortions){
      const backEndPortion = backEndPortions[id]

      if (backEndPlayer.x - backEndPortion.x < 15 && backEndPlayer.y - backEndPortion.y < 15 && backEndPlayer.effect == ''){
        const effect = backEndPortion.effect
        if(effect == 'GROW'){
          backEndPlayer.radius = 30
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'SHINK'){
          backEndPlayer.radius = 10
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        
      }
    }
  }
  


  // update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = radius
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
      continue
    }

    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        if (backEndPlayers[backEndProjectiles[id].playerId])
          backEndPlayers[backEndProjectiles[id].playerId].score++

        console.log(backEndPlayers[backEndProjectiles[id].playerId])
        delete backEndProjectiles[id]
        delete backEndPlayers[playerId]
        break
      }

      
    }
  }

  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
  io.emit('updatePortions', backEndPortions)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
