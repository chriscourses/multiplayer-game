class Player {

  constructor({ x, y, radius, color, speed, projectileRadius, projectileSpeed, username }) {

    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.speed = speed
    this.effect = ''
    this.effectTime = -1
    this.projectileRadius = projectileRadius
    this.projectileSpeed = projectileSpeed
    this.username = username

  }

  draw() {
    c.font = '12px sans-serif'
    c.fillStyle = 'white'
    c.fillText(this.username, this.x - 10, this.y + this.radius + 15)
    c.save()
    c.shadowColor = this.color
    c.shadowBlur = 20
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  updateRadius(radius){
    this.radius = radius
  }

  updateEffect(effect, effectTime){
    this.effect = effect
    this.effectTime = effectTime
  }
}
