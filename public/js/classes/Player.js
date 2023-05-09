class Player {
  constructor({ x, y, radius, color, velocity = { x: 0, y: 0 }, id }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.id = id
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y

    this.velocity.x *= 0.99
    this.velocity.y *= 0.99
  }
}
