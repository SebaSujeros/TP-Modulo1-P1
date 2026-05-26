export class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene")
    }

    init() {
        // Se resetea cada vez que arranca la escena
        this.collected = []
        this.score = 0
        this.timeLeft = 60
    }

    preload() {
        this.load.image("player", "public/assets/1.png")
    }

    create() {
    // Fondo
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)

    // Piso
    this.ground = this.add.rectangle(400, 570, 800, 60, 0x654321)
    this.physics.add.existing(this.ground, true)

    // Plataformas
    const platData = [
        { x: 200, y: 430, w: 160, h: 20 },
        { x: 600, y: 430, w: 160, h: 20 },
    ]
    this.extraPlatforms = []
    platData.forEach(p => {
        const plat = this.add.rectangle(p.x, p.y, p.w, p.h, 0x8B4513)
        this.physics.add.existing(plat, true)
        this.extraPlatforms.push(plat)
    })

    // Jugador
    this.player = this.physics.add.sprite(400, 500, "player")
    this.player.setDisplaySize(50, 50)
    this.player.body.setGravityY(800)

    // Paredes (después de crear el jugador porque sino revienta todo)
    this.wallLeft  = this.add.rectangle(0, 300, 10, 600)
    this.wallRight = this.add.rectangle(800, 300, 10, 600)
    this.physics.add.existing(this.wallLeft, true)
    this.physics.add.existing(this.wallRight, true)

    // Colisiones jugador
    this.physics.add.collider(this.player, this.ground)
    this.physics.add.collider(this.player, this.wallLeft)
    this.physics.add.collider(this.player, this.wallRight)
    this.extraPlatforms.forEach(p => {
        this.physics.add.collider(this.player, p)
    })

    // Input
    this.cursors = this.input.keyboard.createCursorKeys()

    // GRrupo items
    this.items = this.physics.add.group()

    // Collider items con piso
    this.physics.add.collider(this.items, this.ground, (a, b) => {
        const item = a.shapeType ? a : b
        item.bounceHealth--
        if (item.bounceHealth <= 0) item.destroy()
    })

    // Collider items con plataformas
    this.extraPlatforms.forEach(p => {
        this.physics.add.collider(this.items, p, (a, b) => {
            const item = a.shapeType ? a : b
            item.bounceHealth--
            if (item.bounceHealth <= 0) item.destroy()
        })
    })

    // Ooverlap jugador con ítems
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this)

    // Spawn
    this.time.addEvent({
        delay: 500,
        callback: this.spawnItem,
        callbackScope: this,
        loop: true
    })

    // Timer
    this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
    })

    // UI
    this.scoreText = this.add.text(16, 16, 'Puntaje: 0', {
        fontSize: '20px', fill: '#ffffff'
    })
    this.timerText = this.add.text(784, 16, 'Tiempo: 60', {
        fontSize: '20px', fill: '#ffffff'
    }).setOrigin(1, 0)
}

    updateTimer() {
        this.timeLeft--
        this.timerText.setText(`Tiempo: ${this.timeLeft}`)

        if (this.timeLeft <= 0) {
            this.scene.start("EndScene", { won: false, score: this.score })
        }
    }

    createShapeTexture(type, color) {
        const key = `shape_${type}_${color}`

        if (!this.textures.exists(key)) {
            const g = this.make.graphics({ x: 0, y: 0, add: false })
            g.fillStyle(color, 1)
            g.lineStyle(2, 0xffffff, 1)

            if (type === "square") {
                g.fillRect(0, 0, 40, 40)
                g.strokeRect(0, 0, 40, 40)
            }
            else if (type === "triangle") {
                g.fillTriangle(20, 0, 40, 40, 0, 40)
                g.strokeTriangle(20, 0, 40, 40, 0, 40)
            }
            else if (type === "diamond") {
                g.fillTriangle(20, 0, 40, 20, 20, 40)
                g.fillTriangle(20, 0, 0, 20, 20, 40)
                g.strokePoints([
                    { x: 20, y: 0 }, { x: 40, y: 20 },
                    { x: 20, y: 40 }, { x: 0, y: 20 },
                    { x: 20, y: 0 }
                ])
            }
            else if (type === "bad") {
                // Cuadrado rojo oscuro con X blanca
                g.fillStyle(0x880000, 1)
                g.fillRect(0, 0, 40, 40)
                g.lineStyle(4, 0xffffff, 1)
                g.lineBetween(5, 5, 35, 35)
                g.lineBetween(35, 5, 5, 35)
            }

            g.generateTexture(key, 40, 40)
            g.destroy()
        }

        return key
    }

    spawnItem() {
        const x = Phaser.Math.Between(50, 750)

        const types = ["square", "triangle", "diamond"]
        const colors = {
            square:   0xff4444,
            triangle: 0x4444ff,
            diamond:  0xffdd00,
            bad:      0x880000
        }
        // Puntaje por tipo (Mejora 2), bad resta (Mejora 5)
        const pointValues = {
            square:   10,
            triangle: 15,
            diamond:  20,
            bad:      -25
        }

        // 20% de probabilidad de item malo
        const isBad = Phaser.Math.Between(1, 5) === 1
        const randomType = isBad ? "bad" : Phaser.Utils.Array.GetRandom(types)
        const textureKey = this.createShapeTexture(randomType, colors[randomType])

        const item = this.physics.add.image(x, 0, textureKey)
        
        this.items.add(item)
        item.setDisplaySize(40, 40)
        item.body.setGravityY(400)
        item.setBounce(0.6)
        item.setVelocityY(200)
        item.shapeType = randomType
        item.pointValue = pointValues[randomType]
        item.bounceHealth = 2
    }

    collectItem(player, item) {
        const points = item.pointValue

        this.collected.push(item.shapeType)
        this.score += points
        if (this.score < 0) this.score = 0  // no baja de 0
        item.destroy()

        this.scoreText.setText(`Puntaje: ${this.score}`)

        // Condición de victoria: superar 100 puntos (Mejora 2)
        if (this.score >= 100) {
            this.scene.start("EndScene", { won: true, score: this.score })
        }
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-300)
        }
        else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(300)
        }
        else {
            this.player.body.setVelocityX(0)
        }
        if (this.cursors.space.isDown && this.player.body.blocked.down) {
        this.player.body.setVelocityY(-500)
        }
        this.items.getChildren().forEach(item => {
            if (item.y > 650) item.destroy()
        })
    }
}