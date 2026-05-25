import { GameScene } from "./scenes/GameScene.js"
import { WinScene } from './scenes/WinScene.js'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#222222",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [GameScene, WinScene]
}

new Phaser.Game(config)