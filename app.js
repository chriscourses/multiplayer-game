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

const backendPlayers = {}

setInterval(() => {
  io.emit('updatePlayers', backendPlayers)
}, 30)

io.on('connection', (socket) => {
  console.log('a user connected')

  const position = {
    x: 500 * Math.random(),
    y: 500 * Math.random()
  }
  backendPlayers[socket.id] = position

  io.emit('connectAndDisconnectPlayers', backendPlayers)

  socket.on('move', ({ position, id }) => {
    if (!backendPlayers[id]) return
    backendPlayers[id].x = position.x
    backendPlayers[id].y = position.y
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    console.log({ backendPlayers })
    if (!backendPlayers) return

    delete backendPlayers[socket.id]
    io.emit('connectAndDisconnectPlayers', backendPlayers || {})
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('server did load')
