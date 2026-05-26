export class EndScene extends Phaser.Scene {

    constructor() {
        super("EndScene")
    }

    init(data) {
        this.won   = data.won
        this.score = data.score
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)

        const titulo  = this.won ? '¡GANASTE!' : '¡PERDISTE!'
        const color   = this.won ? '#ffdd00'   : '#ff4444'
        const mensaje = this.won
            ? '¡Superaste los 100 puntos!'
            : 'Se acabó el tiempo...'

        this.add.text(400, 180, titulo, {
            fontSize: '64px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        this.add.text(400, 280, mensaje, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(400, 340, `Puntuación final: ${this.score}`, {
            fontSize: '28px',
            fill: '#aaffaa'
        }).setOrigin(0.5)

        const boton = this.add.text(400, 440, '[ Jugar de nuevo ]', {
            fontSize: '22px',
            fill: '#aaaaaa'
        }).setOrigin(0.5).setInteractive()

        boton.on('pointerover', () => boton.setStyle({ fill: '#ffffff' }))
        boton.on('pointerout',  () => boton.setStyle({ fill: '#aaaaaa' }))
        boton.on('pointerdown', () => this.scene.start("GameScene"))
    }
}