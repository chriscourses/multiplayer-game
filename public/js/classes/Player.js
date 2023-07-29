class Player {
  constructor({ x, y, radius, color, speed, projectileRadius, projectileSpeed }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.speed = speed
    this.effect = ''
    this.effectTime = -1
    this.projectileRadius = projectileRadius
    this.projectileSpeed = projectileSpeed
  }

  draw() {
    c.beginPath()
    c.arc(
      this.x,
      this.y,
      this.radius * window.devicePixelRatio,
      0,
      Math.PI * 2,
      false
    )
    c.fillStyle = this.color
    c.fill()
  }

  updateRadius(radius){
    this.radius = radius
  }

  updateEffect(effect, effectTime){
    this.effect = effect
    this.effectTime = effectTime
  }
}
