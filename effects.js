const HEALTH = 50
const HEALTHBAR = 50
const SPEED = 10
const RADIUS = 20
const PROJECTILE_DAMAGE = 10
const PROJECTILE_RADIUS = 10
const PROJECTILE_SPEED = 30
const PORTION_SPWAN_TIME = 500
const EFFECT_TIME = 10000

const EFFECT_INFO = {
    'GROW': {
        effect: 'GROW',
        radius: RADIUS + 10,
        colour: 'red',
        effectTime: EFFECT_TIME
    },
    'SHRINK': {
        effect: 'SHRINK',
        radius: RADIUS - 10,
        colour: 'green',
        effectTime: EFFECT_TIME
    },
    'FLASH': {
        effect: 'FLASH',
        speed: SPEED + 5,
        colour: 'yellow',
        effectTime: EFFECT_TIME
    },
    'SLOW': {
        effect: 'SLOW',
        speed: SPEED - 5,
        colour: 'pink',
        effectTime: EFFECT_TIME,
    },
    'BIG_BULLETS': {
        effect: 'BIG_BULLETS',
        projectileRadius: PROJECTILE_RADIUS + 5,
        projectileSpeed: PROJECTILE_SPEED - 10,
        colour: 'orange',
        effectTime: EFFECT_TIME
    },
    'FAST_BULLETS': {
        effect: 'FAST_BULLETS',
        projectileRadius: PROJECTILE_RADIUS - 5,
        projectileSpeed: PROJECTILE_SPEED + 10,
        colour: 'purple',
        effectTime: EFFECT_TIME
    },
    
}
module.exports = EFFECT_INFO;
