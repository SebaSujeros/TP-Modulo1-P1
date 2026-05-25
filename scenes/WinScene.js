export class WinScene extends Phaser.Scene {

    constructor() {
        super("WinScene")
    }

    create() {
        // Fondo
        this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)

        // Texto principal
        this.add.text(400, 250, '¡GANASTE!', {
            fontSize: '64px',
            fill: '#ffdd00',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Texto secundario
        this.add.text(400, 340, 'Juntaste 2 de cada figura', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        // Botón para reiniciar
        const boton = this.add.text(400, 430, '[ Jugar de nuevo ]', {
            fontSize: '20px',
            fill: '#aaffaa'
        }).setOrigin(0.5).setInteractive()

        boton.on('pointerover', () => boton.setStyle({ fill: '#00ff00' }))
        boton.on('pointerout',  () => boton.setStyle({ fill: '#aaffaa' }))
        boton.on('pointerdown', () => this.scene.start("GameScene"))
    }
}