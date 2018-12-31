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

module.exports = Player;
