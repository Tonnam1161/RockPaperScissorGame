import { Scene } from 'phaser';
import * as THREE from 'three';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.threeScene = null;
        this.threeCamera = null;
        this.threeRenderer = null;
        this.playerHand = null;
        this.opponentHand = null;
        this.gameMode = 'friend'; // 'friend' or 'random'
        this.playerChoice = null;
        this.opponentChoice = null;
        this.timer = 10;
        this.timerInterval = null;
        this.isAnimating = false;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roomId = null;
        this.playerId = null;
        this.opponentName = 'Opponent';
    }

    init(data) {
        if (data && data.mode) {
            this.gameMode = data.mode;
        }
        if (data && data.roomId) {
            this.roomId = data.roomId;
        }
        if (data && data.playerId) {
            this.playerId = data.playerId;
        }
    }

    create() {
        // Hide mode modal and show game UI
        document.getElementById('mode-modal').style.display = 'none';
        document.getElementById('waiting-modal').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        document.getElementById('chat-container').style.display = 'flex';

        // Initialize Three.js scene
        this.initThreeJS();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize chat
        this.initChat();

        // Simulate finding opponent (for demo purposes)
        if (this.gameMode === 'random') {
            this.showWaitingRoom();
        } else {
            // Friend mode - simulate quick match
            setTimeout(() => {
                this.startGame();
            }, 1000);
        }
    }

    initThreeJS() {
        const container = document.getElementById('game-container');
        
        // Create Three.js scene
        this.threeScene = new THREE.Scene();
        this.threeScene.background = new THREE.Color(0x1a1a2e);

        // Create camera
        this.threeCamera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.threeCamera.position.z = 5;
        this.threeCamera.position.y = 2;
        this.threeCamera.lookAt(0, 0, 0);

        // Create renderer
        this.threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.threeRenderer.setSize(container.clientWidth, container.clientHeight);
        this.threeRenderer.shadowMap.enabled = true;
        container.appendChild(this.threeRenderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.threeScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        this.threeScene.add(directionalLight);

        // Create hands (placeholder geometry for now)
        this.createHandModels();

        // Start animation loop
        this.animate();
    }

    createHandModels() {
        // Player hand (left side)
        const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const playerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,
            shininess: 100
        });
        this.playerHand = new THREE.Mesh(playerGeometry, playerMaterial);
        this.playerHand.position.set(-2, 0, 0);
        this.playerHand.castShadow = true;
        this.threeScene.add(this.playerHand);

        // Opponent hand (right side)
        const opponentGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const opponentMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            shininess: 100
        });
        this.opponentHand = new THREE.Mesh(opponentGeometry, opponentMaterial);
        this.opponentHand.position.set(2, 0, 0);
        this.opponentHand.castShadow = true;
        this.threeScene.add(this.opponentHand);

        // Add a platform
        const platformGeometry = new THREE.BoxGeometry(6, 0.2, 2);
        const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -1;
        platform.receiveShadow = true;
        this.threeScene.add(platform);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.threeRenderer && this.threeScene && this.threeCamera) {
            // Idle animation for hands
            if (!this.isAnimating && this.playerHand && this.opponentHand) {
                const time = Date.now() * 0.002;
                this.playerHand.position.y = Math.sin(time) * 0.1;
                this.opponentHand.position.y = Math.sin(time + Math.PI) * 0.1;
            }

            this.threeRenderer.render(this.threeScene, this.threeCamera);
        }
    }

    setupEventListeners() {
        // Choice buttons
        document.getElementById('btn-rock').addEventListener('click', () => this.makeChoice('rock'));
        document.getElementById('btn-paper').addEventListener('click', () => this.makeChoice('paper'));
        document.getElementById('btn-scissors').addEventListener('click', () => this.makeChoice('scissors'));

        // Timer update
        this.timerInterval = setInterval(() => {
            if (this.timer > 0 && !this.playerChoice) {
                this.timer--;
                this.updateTimerDisplay();
                
                if (this.timer === 0) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerFill = document.getElementById('timer-fill');
        
        timerText.textContent = this.timer;
        const percentage = (this.timer / 10) * 100;
        timerFill.style.width = `${percentage}%`;

        // Change color based on time remaining
        if (this.timer <= 3) {
            timerFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (this.timer <= 6) {
            timerFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        }
    }

    makeChoice(choice) {
        if (this.playerChoice || this.isAnimating) return;

        this.playerChoice = choice;
        
        // Disable buttons
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.disabled = true);

        // Update UI
        document.getElementById('result-display').textContent = 'Waiting for opponent...';

        // Simulate opponent choice (in real implementation, this would come from server)
        setTimeout(() => {
            const choices = ['rock', 'paper', 'scissors'];
            this.opponentChoice = choices[Math.floor(Math.random() * choices.length)];
            
            // In friend mode with actual connection, wait for real opponent
            // For demo, we proceed immediately
            this.revealChoices();
        }, 1000 + Math.random() * 2000);
    }

    handleTimeout() {
        if (this.playerChoice) return;

        // Auto-select random choice
        const choices = ['rock', 'paper', 'scissors'];
        this.playerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.disabled = true);

        document.getElementById('result-display').textContent = 'Time\'s up! Random choice made.';

        setTimeout(() => {
            const choices = ['rock', 'paper', 'scissors'];
            this.opponentChoice = choices[Math.floor(Math.random() * choices.length)];
            this.revealChoices();
        }, 1500);
    }

    revealChoices() {
        this.isAnimating = true;
        document.getElementById('result-display').textContent = 'Revealing...';

        // Animate hands
        this.animateReveal();
    }

    animateReveal() {
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Shake animation
            if (progress < 0.7) {
                const shakeIntensity = Math.sin(progress * Math.PI * 10) * 0.2;
                if (this.playerHand) {
                    this.playerHand.position.y = shakeIntensity;
                }
                if (this.opponentHand) {
                    this.opponentHand.position.y = shakeIntensity;
                }
            } else {
                // Reveal phase - change shape based on choice
                this.updateHandShape(this.playerHand, this.playerChoice);
                this.updateHandShape(this.opponentHand, this.opponentChoice);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.determineWinner();
            }
        };

        animate();
    }

    updateHandShape(hand, choice) {
        if (!hand) return;

        // Simple visual feedback - change scale/color based on choice
        hand.scale.set(1, 1, 1);
        
        if (choice === 'rock') {
            hand.scale.set(1.2, 1.2, 1.2);
        } else if (choice === 'paper') {
            hand.scale.set(1.3, 1.3, 0.5);
        } else if (choice === 'scissors') {
            hand.scale.set(1.1, 1.1, 1.1);
        }
    }

    determineWinner() {
        const choices = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        let result = '';
        let resultColor = '#ffffff';

        if (this.playerChoice === this.opponentChoice) {
            result = "It's a Draw!";
            resultColor = '#f39c12';
        } else if (
            (this.playerChoice === 'rock' && this.opponentChoice === 'scissors') ||
            (this.playerChoice === 'paper' && this.opponentChoice === 'rock') ||
            (this.playerChoice === 'scissors' && this.opponentChoice === 'paper')
        ) {
            result = 'You Win!';
            resultColor = '#2ecc71';
            this.playerScore++;
        } else {
            result = 'You Lose!';
            resultColor = '#e74c3c';
            this.opponentScore++;
        }

        // Update score display
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('opponent-score').textContent = this.opponentScore;

        // Show result
        const resultDisplay = document.getElementById('result-display');
        resultDisplay.innerHTML = `
            <div style="color: ${resultColor}; font-size: 0.5em;">
                You: ${choices[this.playerChoice]} | ${this.opponentName}: ${choices[this.opponentChoice]}
            </div>
            <div style="color: ${resultColor}; margin-top: 10px;">
                ${result}
            </div>
        `;

        this.isAnimating = false;

        // Reset for next round after delay
        setTimeout(() => {
            this.resetRound();
        }, 3000);
    }

    resetRound() {
        this.playerChoice = null;
        this.opponentChoice = null;
        this.timer = 10;
        this.isAnimating = false;

        // Reset hand positions
        if (this.playerHand) {
            this.playerHand.position.set(-2, 0, 0);
            this.playerHand.scale.set(1, 1, 1);
        }
        if (this.opponentHand) {
            this.opponentHand.position.set(2, 0, 0);
            this.opponentHand.scale.set(1, 1, 1);
        }

        // Reset UI
        document.getElementById('result-display').textContent = '';
        document.getElementById('timer-text').textContent = '10';
        document.getElementById('timer-fill').style.width = '100%';
        document.getElementById('timer-fill').style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';

        // Enable buttons
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.disabled = false);

        // Restart timer
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.timer > 0 && !this.playerChoice) {
                this.timer--;
                this.updateTimerDisplay();
                
                if (this.timer === 0) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    showWaitingRoom() {
        document.getElementById('waiting-modal').style.display = 'block';
        
        // Simulate finding opponent
        setTimeout(() => {
            document.getElementById('waiting-modal').style.display = 'none';
            this.startGame();
        }, 2000 + Math.random() * 3000);
    }

    startGame() {
        // Generate random opponent name for demo
        const names = ['Player2', 'Challenger', 'Rival', 'Contender', 'Opponent'];
        this.opponentName = names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 1000);
        
        // Add system message to chat
        this.addChatMessage('System', `Matched with ${this.opponentName}! Good luck!`);
    }

    initChat() {
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatToggle = document.getElementById('chat-toggle');
        const chatContainer = document.getElementById('chat-container');
        const chatMessages = document.getElementById('chat-messages');

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                this.sendChatMessage(message);
                chatInput.value = '';
            }
        });

        chatToggle.addEventListener('click', () => {
            if (chatMessages.parentElement.style.display === 'none') {
                chatMessages.style.display = 'flex';
                chatForm.style.display = 'flex';
            } else {
                chatMessages.style.display = 'none';
                chatForm.style.display = 'none';
            }
        });

        // Add welcome message
        this.addChatMessage('System', 'Welcome to Rock Paper Scissors! Use the chat to communicate with your opponent.');
    }

    sendChatMessage(message) {
        // In real implementation, send to server via WebSocket
        this.addChatMessage('You', message);

        // Simulate opponent response for demo
        if (this.gameMode === 'random' || this.gameMode === 'friend') {
            setTimeout(() => {
                const responses = [
                    'Good luck!',
                    'Let\'s go!',
                    'Ready when you are!',
                    'Bring it on!',
                    '😄',
                    '👍',
                    'Interesting choice...',
                    'Haha, nice one!'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addChatMessage(this.opponentName, randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }

    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `<span class="sender">${sender}:</span> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    shutdown() {
        // Cleanup Three.js
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (this.threeRenderer) {
            const container = document.getElementById('game-container');
            if (container && this.threeRenderer.domElement) {
                container.removeChild(this.threeRenderer.domElement);
            }
            this.threeRenderer.dispose();
        }

        // Hide game UI
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('chat-container').style.display = 'none';
    }
}
