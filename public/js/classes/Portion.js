var backendPortionsInfo = {}
fetch('/portions')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    backendPortionsInfo = data
  })
  .catch(error => {
    console.error('Fetch Error:', error);
  });

class Portion {
    constructor({x, y, effect}){
        this.x = x
        this.y = y
        this.effect = effect
        this.portionsInfo = backendPortionsInfo
    }

    draw(){
      
      c.fillStyle = this.portionsInfo[this.effect].colour
      c.fillRect(this.x, this.y, 15, 15)
    }
}