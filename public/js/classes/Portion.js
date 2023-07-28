class Portion {
    constructor({x, y, effect}){
        this.x = x
        this.y = y
        this.effect = effect
    }

    draw(){
        switch (this.effect) {
            case 'GROW':
              c.fillStyle = 'red';
              break;
            case 'FLASH':
              c.fillStyle = 'yellow';
              break;
            case 'BIG_BULLETS':
              c.fillStyle = 'orange';
              break;
            case 'SHINK':
              c.fillStyle = 'green';
              break;
            case 'FAST_BULLETS':
              c.fillStyle = 'purple';
              break;
            case 'SLOW_BULLETS':
              c.fillStyle = 'blue';
              break;
            default:
              // Set a default color or do nothing if none of the cases match
              c.fillStyle = 'white';
              break;
          }          
        
        c.fillRect(this.x, this.y, 15, 15)
    }
}