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

const HEALTH = 50
const HEALTHBAR = 50
const SPEED = 10
const RADIUS = 20
const PROJECTILE_DAMAGE = 10
const PROJECTILE_RADIUS = 10
const PROJECTILE_SPEED = 30
const PORTION_SPWAN_TIME = 1000
const EFFECT_TIME = 10000
//const EFFECTS = ['GROW', 'FLASH', 'BIG_BULLETS', 'SHRINK', 'FAST_BULLETS', 'SLOW_BULLETS', 'SLOW']
const EFFECTS = ['GROW', 'SHRINK', 'FLASH', 'SLOW', 'BIG_BULLETS', 'FAST_BULLETS']

let projectileId = 0
let count = 0
let protionId = 0


io.on('connection', (socket) => {
  console.log('a user connected')

  io.emit('updatePlayers', backEndPlayers)

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * backEndPlayers[socket.id].projectileSpeed,
      y: Math.sin(angle) * backEndPlayers[socket.id].projectileSpeed
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
      radius:backEndPlayers[socket.id].projectileRadius,
      damage: backEndPlayers[socket.id].projectileDamage
    }

    //console.log(backEndProjectiles)
  })

  socket.on('initGame', ({ username, width, height }) => {
    backEndPlayers[socket.id] = {

      x: 1024 * Math.random(),
      y: 576 * Math.random(),

      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      radius:RADIUS,
      speed:SPEED,
      projectileRadius:PROJECTILE_RADIUS,
      projectileSpeed:PROJECTILE_SPEED,
      health:HEALTH,
      healthBar:HEALTHBAR,
      projectileDamage:PROJECTILE_DAMAGE,
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
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayers[socket.id]) return

    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= backEndPlayers[socket.id].speed
        break

      case 'KeyA':
        backEndPlayers[socket.id].x -= backEndPlayers[socket.id].speed
        break

      case 'KeyS':
        backEndPlayers[socket.id].y += backEndPlayers[socket.id].speed
        break

      case 'KeyD':
        backEndPlayers[socket.id].x += backEndPlayers[socket.id].speed
        break
    }

    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius

    if (playerSides.right > 1024)
      backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius

    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius

    if (playerSides.bottom > 576)
      backEndPlayers[socket.id].y = 576 - backEndPlayer.radius
  })
})


// backend ticker
setInterval((radius=PROJECTILE_RADIUS) => {
  if (count == PORTION_SPWAN_TIME){
    protionId+=1
    backEndPortions[protionId] = {
      x: 1024 * Math.random(),
      y: 576 * Math.random(),
      effect:EFFECTS[(Math.floor(Math.random() * EFFECTS.length))]
    }
    console.log(backEndPortions)
    count = 0
  }
  count++
  

  // Portions Effects Applications
  for (const playerId in backEndPlayers){
    const backEndPlayer = backEndPlayers[playerId]
    // This Restrict player from taking more portions
    if (backEndPlayer.effectTime > 0){
      backEndPlayer.effectTime -= 15
    }

    // Restoring the portions effect
    if (backEndPlayer.effectTime < 0){
      
      if(backEndPlayer.effect == 'GROW'){
        backEndPlayer.radius = RADIUS
      }
      if(backEndPlayer.effect == 'SHRINK'){
        backEndPlayer.radius = RADIUS
      }
      if(backEndPlayer.effect == 'FLASH'){
        backEndPlayer.speed = SPEED
      }
      if(backEndPlayer.effect == 'SLOW'){
        backEndPlayer.speed = SPEED
      }
      if(backEndPlayer.effect == 'BIG_BULLETS'){
        backEndPlayer.projectileRadius = PROJECTILE_RADIUS
        backEndPlayer.projectileSpeed = PROJECTILE_SPEED
      }
      if(backEndPlayer.effect == 'FAST_BULLETS'){
        backEndPlayer.projectileRadius = PROJECTILE_RADIUS
        backEndPlayer.projectileSpeed = PROJECTILE_SPEED
      }

      backEndPlayer.effect = ''
      backEndPlayer.effectTime = -1
    }

    // Collision of player with portions
    for (const id in backEndPortions){
      const backEndPortion = backEndPortions[id]

      if (Math.abs(backEndPlayer.x - backEndPortion.x) < 15 && Math.abs(backEndPlayer.y - backEndPortion.y) < 15 && backEndPlayer.effect == ''){
        const effect = backEndPortion.effect
        if(effect == 'GROW'){
          backEndPlayer.radius = RADIUS + 10
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'SHRINK'){
          backEndPlayer.radius = RADIUS - 10
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'FLASH'){
          backEndPlayer.speed = SPEED + 5
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'SLOW'){
          backEndPlayer.speed = SPEED - 5
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'BIG_BULLETS'){
          backEndPlayer.projectileRadius = PROJECTILE_RADIUS + 5
          backEndPlayer.projectileSpeed = PROJECTILE_SPEED - 10
          backEndPlayer.effect = effect
          backEndPlayer.effectTime = EFFECT_TIME
          delete backEndPortions[id]
        }
        if(effect == 'FAST_BULLETS'){
          backEndPlayer.projectileRadius = PROJECTILE_RADIUS - 5
          backEndPlayer.projectileSpeed = PROJECTILE_SPEED + 10
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

    const PROJECTILE_RADIUS = backEndProjectiles[id].radius
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
        backEndProjectiles[id].playerId !== playerId && backEndPlayer.health <= 0
      ) {
        if (backEndPlayers[backEndProjectiles[id].playerId])
          backEndPlayers[backEndProjectiles[id].playerId].score++

        console.log(backEndPlayers[backEndProjectiles[id].playerId])
        delete backEndProjectiles[id]
        delete backEndPlayers[playerId]
        break
      }
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId && backEndPlayer.health > 0
      ){
        backEndPlayer.health = backEndPlayer.health - backEndProjectiles[id].damage
        delete backEndProjectiles[id]
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
