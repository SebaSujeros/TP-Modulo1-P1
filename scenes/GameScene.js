export class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene")
        this.collected = []  // ← array, no objeto
    }

    preload() {
        this.load.image("player", "public/assets/1.png")
    }

    create() {
        // FONDO
        this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)

        // PISO
        this.ground = this.add.rectangle(400, 570, 800, 60, 0x654321)
        this.physics.add.existing(this.ground, true)

        // JUGADOR
        this.player = this.physics.add.sprite(400, 500, "player")
        this.player.setDisplaySize(50, 50)
        this.player.body.setGravityY(500)

        // COLISION jugador con piso
        this.physics.add.collider(this.player, this.ground)

        // INPUT
        this.cursors = this.input.keyboard.createCursorKeys()

        // GRUPO ITEMS
        this.items = this.physics.add.group()

        // ✅ Colliders DESPUÉS de definir items y ground
        this.physics.add.collider(this.player, this.ground)
        this.physics.add.collider(this.items, this.ground, (a, b) => {
        if (a.shapeType) {
            a.destroy()
        } else {
            b.destroy()
        }
})

        // OVERLAP jugador con ítems (recolección)
        this.physics.add.overlap(
            this.player,
            this.items,
            this.collectItem,
            null,
            this
        )

        // SPAWN cada 1 segundo
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        })

        // UI
        this.scoreText = this.add.text(16, 16,
            'Cuadrados: 0 | Triángulos: 0 | Rombos: 0',
            { fontSize: '16px', fill: '#ffffff' }
        )
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
                    { x: 20, y: 0 },
                    { x: 40, y: 20 },
                    { x: 20, y: 40 },
                    { x: 0, y: 20 },
                    { x: 20, y: 0 }
                ])
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
            square: 0xff4444,
            triangle: 0x4444ff,
            diamond: 0xffdd00
        }

        const randomType = Phaser.Utils.Array.GetRandom(types)
        const textureKey = this.createShapeTexture(randomType, colors[randomType])

        const item = this.physics.add.image(x, 0, textureKey)
        item.setDisplaySize(40, 40)
        item.body.setGravityY(0)
        item.shapeType = randomType

        this.items.add(item)
        item.setVelocityY(200)

        item.checkWorldBounds = true
        item.outOfBoundsKill = true
    }

    collectItem(player, item) {
        const type = item.shapeType

        this.collected.push(type)  // ✅ push funciona porque ahora es array
        item.destroy()

        const squares   = this.collected.filter(i => i === "square").length
        const triangles = this.collected.filter(i => i === "triangle").length
        const diamonds  = this.collected.filter(i => i === "diamond").length

        this.scoreText.setText(
            `Cuadrados: ${squares} | Triángulos: ${triangles} | Rombos: ${diamonds}`
        )

        if (squares >= 2 && triangles >= 2 && diamonds >= 2) {
            this.scene.start("WinScene")
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
    }
}