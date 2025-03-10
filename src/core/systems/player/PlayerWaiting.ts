import Phaser from 'phaser';

class PlayerWaiting {
    private lastAnimChangeTime: number | null = null;
    private lastAnimKey: string | null = null;
    private waitingTime: number = 10800;
    private readonly incrementTime: number = 14400;

    handleWaiting(entity: Phaser.Physics.Arcade.Sprite) {
        const currentAnimKey = entity.anims.currentAnim?.key;

        if(currentAnimKey !== "waiting" && currentAnimKey !== "idle") {
            this.waitingTime = 10800;
            this.lastAnimKey = currentAnimKey ?? null;
            return;
        }

        if (currentAnimKey !== this.lastAnimKey) {
            this.lastAnimKey = currentAnimKey ?? null;
            this.lastAnimChangeTime = Date.now();
            return;
        } 
        
        if (this.lastAnimChangeTime && Date.now() - this.lastAnimChangeTime > this.waitingTime) {
            if (currentAnimKey !== 'waiting') {
                entity.play('waiting');
                if (this.waitingTime < 43200) {
                    this.waitingTime += this.incrementTime;
                }
                setTimeout(() => entity.play('idle'), 1400 + (this.waitingTime / 10));
            }
        }
    }
}

export { PlayerWaiting };
