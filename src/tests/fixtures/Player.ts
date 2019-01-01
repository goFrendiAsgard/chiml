export class Player {
    protected weapon: string;
    protected damage: string;

    constructor(protected name: string) {
    }

    public setWeapon(weaponName) {
        this.weapon = weaponName;
    }

    public setDamage(damage) {
        this.damage = damage;
    }

    public attack() {
        return `${this.name} attack with ${this.weapon}, deal ${this.damage} damage`;
    }

}

export function initPlayer(name: string): Player {
    return new Player(name);
}
