import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.finalScore = data?.finalScore || { player: 0, opponent: 0 };
    }

    create() {
        // Hide game UI elements
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('chat-container').style.display = 'none';

        // Show simple game over screen with Phaser
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        const winnerText = this.finalScore.player > this.finalScore.opponent ? 'You Won!' : 
                          this.finalScore.player < this.finalScore.opponent ? 'You Lost!' : 'Draw!';
        const color = this.finalScore.player > this.finalScore.opponent ? '#2ecc71' :
                     this.finalScore.player < this.finalScore.opponent ? '#e74c3c' : '#f39c12';

        this.add.text(512, 284, winnerText, {
            fontFamily: 'Arial Black', fontSize: 64, color: color,
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 384, `Final Score: ${this.finalScore.player} - ${this.finalScore.opponent}`, {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 484, 'Click to return to menu', {
            fontFamily: 'Arial', fontSize: 24, color: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            // Reset UI state
            document.getElementById('mode-modal').style.display = 'block';
            document.getElementById('player-score').textContent = '0';
            document.getElementById('opponent-score').textContent = '0';
            this.scene.start('MainMenu');
        });
    }
}
