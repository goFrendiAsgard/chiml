export declare class Player {
    protected name: string;
    protected weapon: string;
    protected damage: string;
    constructor(name: string);
    setWeapon(weaponName: any): void;
    setDamage(damage: any): void;
    attack(): string;
}
