var demo = {}
var centerX = 2000 / 2;
var centerY = 1536 / 2;
var speed = 10;
var jump = 5;
var Megaman;
var vel = 700;
var cursors;
var bullets
var bulletTime = 0;
var score = 0;
var left;
var right;
var enemies;
var explosions;
var layer;
var tilesprite;
var platforms;
var bg;
var score;
var scoreString = '';
var scoreText;
var stateText;
var livingEnemies = [];
var health;
var healthString = '';
var healthText;
var power;
var poweredUp;
var specials;
demo.state0 = function () {};

demo.state0.prototype = {
    preload: function () {

        game.load.image('stars',  'assets/starstruck/starfield.jpg')
        game.load.image('platform', 'assets/starstruck/paddle2.png')
        game.load.spritesheet('Megaman', 'assets/sprites/megaman (2).png', 332, 300)
        game.load.image('bullet', 'assets/sprites/shot.png')
          game.load.image('special', 'assets/sprites/shot3.png')
        game.load.image('background', 'assets/background/bg.png')
        game.load.spritesheet('enemy', 'assets/sprites/flyer.png', 64, 64)
        game.load.spritesheet('kaboom', 'assets/sprites/explode.png', 128, 128);
        game.load.spritesheet('powerup', 'assets/sprites/powerup.png', 64 ,64)

    },
    create: function () {
        //         game.stage.backgroundColor = "#000000";
        //phys start
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //set gravity
        game.physics.arcade.gravity.y = 3000;

        tileSprite = game.add.tileSprite(0, 0, 2000, 1160, 'stars');

        addChangeStateEventListeners();

        //set game bounds
        game.world.setBounds(0, 0, 2000, 1160);
        // scales image with window
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
        SpecialButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
        // Score
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, {
            font: '34px Arial',
            fill: '#fff'
        });

       
        



       
        // add char
        Megaman = game.add.sprite(900, 300, 'Megaman')
        
        power = game.add.sprite(400,200, 'powerup')
        power.enableBody = true;
        game.physics.enable(power, Phaser.Physics.ARCADE);
        power.anchor.setTo(0.5,0.5)
        power.body.collideWorldBounds = true;
       

        // Bullet Group
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', -1);
        bullets.setAll('anchor.y', 0.7);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
        
        //Special bullet group
        specials = game.add.group();
        specials.enableBody = true;
        specials.physicsBodyType = Phaser.Physics.ARCADE;
        specials.createMultiple(30, 'special');
        specials.setAll('anchor.x', -1);
        specials.setAll('anchor.y', 0.7);
        specials.setAll('outOfBoundsKill', true);
        specials.setAll('checkWorldBounds', true);
        // Enemies
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;

        createEnemies();
        //  An explosion pool
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(setupInvader, this);

        Megaman.anchor.setTo(0.5, 0.5);
        // enable physics to megaman
        game.physics.enable(Megaman, Phaser.Physics.ARCADE);
        Megaman.body.collideWorldBounds = true;
        // adjust sprite size
        Megaman.scale.setTo(0.4);
        Megaman.body.allowGravity = true;

        //set char to follow
        game.camera.follow(Megaman);

        Megaman.animations.add('walk', [0, 1, 2]);

        // Platform groups
        platforms = game.add.group();
        platforms.enableBody = true;
        platforms.physicsBodyType = Phaser.Physics.ARCADE;
        createPlatforms();

         //  Text
        stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {
            font: '84px Arial',
            fill: '#fff'
        });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;
        
        //health
        health = 100
        healthText = game.add.text(game.world.width - 300, 10, 'Health : ' + healthString + health, { font: '34px Arial', fill: '#fff' });

        cursors = game.input.keyboard.createCursorKeys();

    },
    update: function () {
        game.physics.arcade.collide(Megaman, platforms)
        game.physics.arcade.collide(Megaman, power)
        game.physics.arcade.collide(power, platforms)
        // MOVE RIGHT
        Megaman.body.velocity.x = 0;
        if (cursors.right.isDown) {
            Megaman.body.velocity.x += vel;
            Megaman.scale.setTo(0.4, 0.4);
            Megaman.animations.play('walk', 5, true)
            right = true;
            left = false;
        }
        // MOVE LEFT
        else if (cursors.left.isDown) {
            Megaman.body.velocity.x -= vel;
            Megaman.scale.setTo(-0.4, 0.4);
            left = true;
            right = false;
        }



        // JUMP
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
           && Megaman.body.touching.down) {
            Megaman.body.velocity.y = -1500;
        }
        // FIRE
        if (fireButton.isDown && left)
            fireBulletLeft();
        if (fireButton.isDown && right)
            fireBulletRight();
        //SPECIAL FIRE
        if (SpecialButton.isDown && right && poweredUp)
            specialBulletRight();
        if (SpecialButton.isDown && left && poweredUp)
            specialBulletLeft();

        // run collision
        game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
         game.physics.arcade.overlap(specials, enemies, collisionHandler, null, this);
        game.physics.arcade.overlap(enemies, Megaman, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(power, Megaman, consumePower, null, this);
    }

};

function changeState(i, stateNum) {

    game.state.start('state' + stateNum)

}

function addKeyCallback(key, fn, args) {
    game.input.keyboard.addKey(key).onDown.add(fn, null, null, args);
}

function addChangeStateEventListeners() {
    addKeyCallback(Phaser.Keyboard.ZERO, changeState, 0);
    addKeyCallback(Phaser.Keyboard.ONE, changeState, 1);
    addKeyCallback(Phaser.Keyboard.TWO, changeState, 2);
}

function fireBulletLeft() {
    if (game.time.now > bulletTime) {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet) {

            //  And fire it 
            bullet.reset(Megaman.x - 200, Megaman.y + 12);
            bullet.body.allowGravity = false;
            bullet.body.velocity.x = -2000;
            bulletTime = game.time.now + 150;

        }
    }


}

function fireBulletRight() {
    if (game.time.now > bulletTime) {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet) {

            //  And fire it
            bullet.reset(Megaman.x - 35, Megaman.y + 12);
            bullet.body.allowGravity = false;
            bullet.body.velocity.x = 2000;
            bulletTime = game.time.now + 150;

        }
    }


}

function specialBulletRight() {
    if (game.time.now > bulletTime) {
        //  Grab the first bullet we can from the pool
        special = specials.getFirstExists(false);

        if (special) {

            //  And fire it
               special.scale.setTo(1,1)
            special.reset(Megaman.x - 200, Megaman.y + 35);
            special.body.allowGravity = false;
            special.body.velocity.x = 2000;
            bulletTime = game.time.now + 150;

        }
    }


}
function specialBulletLeft() {
    if (game.time.now > bulletTime) {
        //  Grab the first bullet we can from the pool
        special = specials.getFirstExists(false);

        if (special) {

            //  And fire it
            special.scale.setTo(-1,1)
            special.reset(Megaman.x + 175, Megaman.y + 35);
            special.body.allowGravity = false;
            special.body.velocity.x = -2000;
         
            bulletTime = game.time.now + 150;

        }
    }


}

function createEnemies() {
    for (i = 0; i < 6; i++) {
        var enemy = enemies.create(900 + i * 100, 200 + (Math.random() * 800), 'enemy');
        enemy.anchor.setTo(0.5, 1);
        enemy.scale.setTo(1.5, 1.5)

        enemy.body.allowGravity = false;
        livingEnemies.push(enemy)
    }
    for (i = 0; i < 3; i++) {
        var enemy = enemies.create(0 + i * 100, 1000 - (Math.random(10) * 300), 'enemy');
        enemy.anchor.setTo(0.5, 1);
        enemy.scale.setTo(1.5, 1.5)

        enemy.body.allowGravity = false;
        livingEnemies.push(enemy)
    }
     for (i = 0; i < 3; i++) {
        var enemy = enemies.create(200 + i * 78, 600 - Math.random() * 800, 'enemy');
        enemy.anchor.setTo(0.5, 1);
        enemy.scale.setTo(1.5, 1.5)

        enemy.body.allowGravity = false;
        livingEnemies.push(enemy)
    }
    enemies.x = 100;
    enemies.y = 100;

    var tween = game.add.tween(enemies).to({
        x: 200
    }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);

}

function createPlatforms() {
    
    //starting plat
    for (i = 0; i < 2; i++) {
        var platform = platforms.create(850 + i * 70, 400, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }

    //middle group
    for (i = 0; i < 3; i++) {
        var platform = platforms.create(850 + i * 70, 900, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }
    //left group
    for (i = 0; i < 3; i++) {
        var platform = platforms.create(300 + i * 70, 500, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }
     for (i = 0; i < 3; i++) {
        var platform = platforms.create(500 + i * 70, 700, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }
    //right group
    for (i = 0; i < 3; i++) {
        var platform = platforms.create(1400 + i * 70, 500, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }
    
     for (i = 0; i < 3; i++) {
        var platform = platforms.create(1200 + i * 70, 700, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }
    //floor
    for (i = 0; i < 29; i++) {
        var platform = platforms.create(0 + i * 70, 1200, 'platform');
        //game.add.tileSprite(1, 1200*i, 0, 0, 'platform')
        platform.body.allowGravity = false;
        platform.body.collideWorldBounds = true;
        platform.body.immovable = true;


    }

}

function descend() {

    enemies.x += 10;

}

function setupInvader(invader) {

    invader.anchor.x = 0.3;
    invader.anchor.y = 0.3;
    invader.animations.add('kaboom');

}

function collisionHandler(bullet, enemy) {
    bullet.kill();
    enemy.kill();
    
    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    explosion.play('kaboom', 30, false, true);
    score += 100;
    scoreText.text = scoreString + score;
    
    if (enemies.countLiving() == 0) {
        stateText.text = "Thanks for playing. Click to restart"
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
        
    }
}

function enemyHitsPlayer(Megaman, enemy){
    enemy.kill()
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    explosion.play('kaboom', 30, false, true);
    health -= 10;
    healthText.text = 'Health : ' + healthString + health;
    if (health == 0) {
        stateText.text = "You Lost. Click to restart"
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
        
        
    }
    
}


function restart(){
    enemies.removeAll();
    createEnemies();
    stateText.visible = false;
    score = 0;
    scoreText.text = scoreString + score;
    health = 100;
    healthText.text = 'Health : ' + healthString + health;
}

function consumePower(power, Megaman){
    power.kill()
    poweredUp = true;
    //TODO
    //Alert user power up consumed. press S to use
    stateText.text = "PoweredUp! Press S to use"
    stateText.visible = true;
       setTimeout(function() { stateText.visible = false }, 2000)
}
