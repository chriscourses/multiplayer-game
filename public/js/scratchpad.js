// ----------------
// backend
// ----------------
const backendPlayers = {}

// ----------------
// frontend
// ----------------
const frontendPlayers = {}

// make connection (emits connection event)
const socket = io()

// ----------------
// backend
// ----------------

// populate backend object
backendPlayers[socket.id] = {
  x: Math.random() * 500,
  y: Math.random() * 500
}

// object now looks like this:
// backendPlayers = {
//   jsd24j: {
//     x: 220,
//     y: 220
//   }
// }

// frontend object is still {} though
// also need a way to say: this new id belongs to a specific frontend player
io.emit('createPlayers', players)

// ----------------
// frontend
// ----------------

// loop through all backend players and populate frontend object
// now frontend and backend objects are in sync
// frontendPlayers = {
//   jsd24j: {
//     x: 220,
//     y: 220
//   }
// }
