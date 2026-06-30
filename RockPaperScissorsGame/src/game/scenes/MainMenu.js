import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Hide game UI elements initially
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('chat-container').style.display = 'none';
        document.getElementById('waiting-modal').style.display = 'none';
        document.getElementById('mode-modal').style.display = 'block';

        // Setup mode selection buttons
        document.getElementById('play-friend').addEventListener('click', () => {
            this.scene.start('Game', { mode: 'friend' });
        });

        document.getElementById('play-random').addEventListener('click', () => {
            this.scene.start('Game', { mode: 'random' });
        });

        // Cancel search button
        document.getElementById('cancel-search').addEventListener('click', () => {
            document.getElementById('waiting-modal').style.display = 'none';
            document.getElementById('mode-modal').style.display = 'block';
        });
    }

    shutdown() {
        // Remove event listeners to prevent duplicates
        const friendBtn = document.getElementById('play-friend');
        const randomBtn = document.getElementById('play-random');
        const cancelBtn = document.getElementById('cancel-search');
        
        if (friendBtn) friendBtn.replaceWith(friendBtn.cloneNode(true));
        if (randomBtn) randomBtn.replaceWith(randomBtn.cloneNode(true));
        if (cancelBtn) cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    }
}
