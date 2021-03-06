"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(name) {
        this.name = name;
    }
    setWeapon(weaponName) {
        this.weapon = weaponName;
    }
    setDamage(damage) {
        this.damage = damage;
    }
    attack() {
        return `${this.name} attack with ${this.weapon}, deal ${this.damage} damage`;
    }
}
exports.Player = Player;
function initPlayer(name) {
    return new Player(name);
}
exports.initPlayer = initPlayer;
//# sourceMappingURL=Player.js.map