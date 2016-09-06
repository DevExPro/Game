var gameWidth = window.innerWidth - 100;
var gameHeight = window.innerHeight - 100;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

WebFontConfig = {
    google: {
      families: ['Audiowide']
    }   
}

function preload () {
  game.load.image('background', 'images/back.png');
  game.load.image('bullet', 'images/pewpew2.png');
  game.load.image('fire', 'images/emit.png');
  game.load.image('ship2', 'images/shipGreen.png');
  game.load.spritesheet('boom1', 'images/expolode2.png', 39, 38, 7);
  game.load.image('enemy', 'images/enemyShip2.png');
  game.load.image('heart', 'images/lifeShip.png');
  game.load.image('powerUp', 'images/lightning2.png');
  game.load.spritesheet('beam', 'images/laserBeam.png', 40, 16, 11);
  game.load.spritesheet('pauseButton', 'images/pause.png', 36, 36, 2);
  game.load.spritesheet('playerExplode', 'images/playerExplode.png', 100, 100, 8);
  game.load.spritesheet('playButton', 'images/startButton.png', 182, 52);
  game.load.image('title', 'images/evasion2.png');
  game.load.image('gameOver', 'images/gameOverTitle.png');
  game.load.image('winTitle', 'images/victory.png');
  game.load.image('restartButton', 'images/restartButton5.png');
  game.load.image('playerShield', 'images/shield.png');
  game.load.image('powerEnemy', 'images/Ship4.png');
  game.load.image('shieldMove', 'images/shieldMove.png');
  game.load.spritesheet('bomb', 'images/bomb.png', 33, 38, 71);
  game.load.image('bombPic', 'images/bomb2.png');
  game.load.image('numBombIcon', 'images/bomb3.png');
  game.load.spritesheet('muteButton', 'images/muteButton.png', 36, 36, 2);
  
  game.load.audio('blaster', 'sounds/blaster.mp3');
  game.load.audio('player_death', 'sounds/player_death.wav');
  game.load.audio('enemy_death', 'sounds/alien_death1.wav');
  game.load.audio('pickup', 'sounds/pickup.wav');
  game.load.audio('menuSound', 'sounds/menu_switch.mp3');    
  game.load.audio('hitSound', 'sounds/menu_select.mp3');
  game.load.audio('countSound', 'sounds/numkey.wav');
  
  game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}

var bulletTime = 0;
var bullet;
var pauseButton, muteButton, unmuteButton;
var explosion;
var pickup, menuSound, hitSound, blaster, countSound, player_death, enemy_death;
var player;
var timer;
var waveTotal;
var powerUp;
var shootTimer;
var fireMode;
var offset;
var power;
var beam;
var playButton;
var restart;
var gameStartTimer;
var totalEnemies;
var pausePressed;
var bombSprite = 0;
var bombExplode = 0;
var bombTime = 0;

function create () {
    
    //background = game.add.sprite(0, 0, 'background');
    
    var titleBack = game.add.sprite((gameWidth/2) - 258, 0, 'title');
    playButton = game.add.button(gameWidth/2, gameHeight/2 - 20, 'playButton', play, this, 2, 1, 0);
    playButton.anchor.setTo(0.5, 0.5);
    
    game.paused = true;
    game.input.onDown.add(play, self);
    
        ///////////////// Main Menu Buttons ////////////////////
    function play(event){
       if(game.paused){
            var x1 = gameWidth/2 - 182/2, x2 = gameWidth/2 + 182/2,
                y1 = gameHeight/2 - 52/2, y2 = gameHeight/2 + 52/2;
            if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
                game.paused = false;
                playButton.kill();
                titleBack.kill();
            }
        }
    }

    ///////////////// The Bar /////////////////////////////
    barLength = gameWidth/3;
    barProgress = barLength;
    var backRect = this.add.bitmapData((gameWidth/3) + 8, 16);
    var topRect = this.add.bitmapData((gameWidth/3) + 6, 14);
    game.add.sprite((gameWidth / 2) - (barLength /2) - 4, gameHeight - 54, backRect);
    game.add.sprite((gameWidth / 2) - (barLength /2) - 3, gameHeight - 53, topRect);
    
    backRect.context.fillStyle = '#0f0';
    topRect.context.fillStyle = '#000';
    backRect.context.fillRect(0, 0, (gameWidth/3) + 8, 16);
    topRect.context.fillRect(0, 0, (gameWidth/3) + 6, 14);
    
    bar = this.add.bitmapData(barLength, 8);
    game.add.sprite((gameWidth/2) - (barLength /2), gameHeight - 50, bar);
    game.add.tween(this).to({barProgress: 0}, 2000, null, true, 0, Infinity);
    
    
    ////////////// Player Sprite ////////////////////
//    pickShield = game.add.sprite(0, 0, 'playerShield');
    moveItShield = game.add.sprite(0, 0, 'shieldMove');
//    game.physics.arcade.enableBody(pickShield);
    game.physics.arcade.enableBody(moveItShield);
    player = game.add.sprite(gameWidth/2, (gameHeight/3)*2, 'ship2');
    player.oldDirection = player.rotation;
    player.hittable = true;
    player.bombs = 2000;
    var bombIcon = game.add.sprite(140, gameHeight - 31, 'numBombIcon');
    numBombs = game.add.text(164, gameHeight - 20, player.bombs);
    numBombs.anchor.setTo(0, 0.5);
    numBombs.font = 'Audiowide';
    numBombs.fontSize = 25;
    numBombs.fill = '#000000';
    numBombs.stroke = '#62e308';
    numBombs.strokeThickness = 1;
    
    bombPickup = game.add.sprite(200, 300, 'bombPic');
    game.physics.arcade.enableBody(bombPickup);
    
    /////////////// Pause Button ////////////////////
    pauseButton = game.add.button(gameWidth - 45, gameHeight - 45, 'pauseButton', actionOnClick, this, 1, 0, 1);
    pauseButton.hitArea = new Phaser.Rectangle(10, 20, 36, 36);
    //button = game.add.button(gameWidth/2, gameHeight/2, 'playButton', playClick, this);
   // pauseButton.anchor.setTo(1, 1);
    pauseButton.onInputOver.add(over, this);
    pauseButton.onInputOut.add(out, this);
    pauseButton.onInputUp.add(up, this);
     game.input.onDown.add(unpause, self);

    function unpause(event){
        if(game.paused && pausePressed){
            game.paused = false;
            pausePressed = false;
                
            }
        }
    ////////////// Mute Button //////////////////////
    
    muteButton = game.add.button(gameWidth - 45, gameHeight - 100, 'muteButton', muteGame, this);
    muteButton.hitArea = new Phaser.Rectangle(10, 20, 36, 36);
    //muteButton.anchor.setTo(0, 0.5);


  ///////////////// Player Lives Section ///////////
    player.lives = game.add.group();
    var life = player.lives.create(74, gameHeight - 35, 'heart');
    life = player.lives.create(42, gameHeight - 35, 'heart');
    life = player.lives.create(9, gameHeight - 35, 'heart');
    life = player.lives.create(0, 0);


  ////////////////// Emitter section //////////////////
    game.physics.arcade.enableBody(player);
    player.body.immovable = true;
    emitterLeft = game.add.emitter(0, 0, 1000);
    emitterRight = game.add.emitter(0, 0, 1000);
    emitterLeft.makeParticles('fire');
    emitterRight.makeParticles('fire');
    player.addChild(emitterLeft);
    player.addChild(emitterRight);
    
/*    shield = player.addChild(game.make.sprite(0, 0, 'playerShield'));
    shield.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enableBody(shield);
    shield.body.immovable = true;
    shield.body.setSize(43, 43, 21, 21);
    shield.visible = false;*/
    
    moveableShield = player.addChild(game.make.sprite(0, 0, 'shieldMove'));
    moveableShield.anchor.setTo(0.5, 0.5);
 //   game.physics.arcade.enableBody(moveableShield);
  //  moveableShield.body.immovable = true;
   // moveableShield.body.setSize(43, 43, 21, 21);
    moveableShield.visible = false;
    
    emitterLeft.y = 16;
    emitterLeft.x = -10;
      
    emitterRight.y = -16;
    emitterRight.x = -10;
  
    emitterLeft.lifespan = 150;
    emitterRight.lifespan = 150;
    emitterRight.maxParticleSpeed = new Phaser.Point(-100, 50);
    emitterRight.minParticleSpeed = new Phaser.Point(-200, -50);

    emitterLeft.maxParticleSpeed = new Phaser.Point(-100, 50);
    emitterLeft.minParticleSpeed = new Phaser.Point(-200, -50);

  
  ///////////////// Spawning Enemies //////////////////////////
    //var totalEnemies = 5;

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    enemies.setAll('body.collideWorldBounds', true);
    
    gameStartTimer = game.time.create();
    var levelOneTimer = game.time.create();
    gameStartTimer.start();
    gameStartTimer.add(0, countDown, this, 3);
    
    gameStartTimer.add(1000/*1175*/, countDown, this, 2);
   // gameStartTimer.start();
    gameStartTimer.add(1965/*2175*/, countDown, this, 1);
    levelOneTimer.add(3000, levelOne, this);
  //  gameStartTimer.start();
   // gameStartTimer.onComplete.add(levelOneTimer.start, this);
   
   powerEnemies = game.add.group();
   powerEnemies.enableBody = true;
   powerEnemies.physicsBodyType = Phaser.Physics.ARCADE;
   

    levelOneTimer.start();
    
  ////////////// Player Attributes Sction /////////////////
    player.hit = 0;
    player.flash = 0;

    //game.camera.follow(player);
    //game.physics.arcade.enable(player);
    game.world.setBounds(0, 0, gameWidth, gameHeight);
   
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);
    player.body.drag.set(80);
    player.body.maxVelocity.set(350);
   
  /////////////////// Bullets Section ////////////////////// 
    bullets = game.add.group();
    fireMode = 1;
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    
    for (var i = 0; i < 50; i++)
    {
        var b = bullets.create(0, 0, 'bullet');
        b.name = 'bullet' + i;
       // b.anchor.setTo(-.9, 0.5);
        b.anchor.setTo(-.6, 0.5);
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(resetBullet, this);
    }
   // fireButton = game.input.keyboard.addKey(Phaser.KeyCode.);
   thrustButton = game.input.keyboard.addKey(Phaser.KeyCode.W);
   shieldLeft = game.input.keyboard.addKey(Phaser.KeyCode.A);
   shieldRight = game.input.keyboard.addKey(Phaser.KeyCode.D);
   spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
   
  ////////////// We are in The Beam ////////////////////////
 /*   beams = game.add.group();
    beams.enableBody = true;
    beams.physicsBodyType = Phaser.Physics.ARCADE;*/
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    
    for (var k = 0; k < 50; k++)
    {
        var e = explosions.create(0, 0, 'boom1');
        e.name = 'explosion' + k;
     //   e.anchor.setTo(.5, .5);
        e.exists = false;
        e.visible = false;
        e.checkWorldBounds = true;
        
    }

  ////////////////// Powers ////////////////////////////////
    powers = game.add.group();
    powers.enableBody = true;
    powers.physicsBodyType = Phaser.Physics.ARCADE;
    
    
    checkPlayerCollision = 0;
    
    ///////////////// Audio ///////////////////////
    blaster = game.add.audio('blaster');
    player_death = game.add.audio('player_death');
    enemy_death = game.add.audio('enemy_death');
    hitSound = game.add.audio('hitSound');
    pickup = game.add.audio('pickup');
    countSound = game.add.audio('countSound');
}





function update () {
   game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
   game.physics.arcade.overlap(player, powers, getPowerUp, null, this);
 //  game.physics.arcade.overlap(player, powerEnemies, powerShipCollide, null, this);
   game.physics.arcade.overlap(bullets, powerEnemies, powerBulletCollide, null, this);
//   game.physics.arcade.overlap(player, pickShield, shieldPower, null, this);
   game.physics.arcade.overlap(player, moveItShield, moveShield, null, this);
   //game.physics.arcade.overlap(beams, enemies, beamCollision, null, this);
   game.physics.arcade.overlap(player, bombPickup, addInventory, null, this);
   game.physics.arcade.overlap(enemies, bombSprite, hitBomb, null, this);
   game.physics.arcade.overlap(enemies, bombExplode, hitBombExplosion, null, this);
   
   numBombs.kill();
   numBombs = game.add.text(164, gameHeight - 20, player.bombs);
    numBombs.anchor.setTo(0, 0.5);
    numBombs.font = 'Audiowide';
    numBombs.fontSize = 25;
    numBombs.fill = '#000000';
    numBombs.stroke = '#62e308';
    numBombs.strokeThickness = 1;


    if(player.alive){
        enemies.forEach(getEnSpeed, this);
        enemies.forEach(rotateEnemies, this);
    }
   
       player.newDirection = 0;
       player.rotation = game.physics.arcade.angleToPointer(player);
       if(player.oldDirection - 0.025 <= player.rotation && player.oldDirection + 0.025 >= player.rotation)
       {
           player.newDirection = 0;
       }
       else if(player.oldDirection > player.rotation)
       {
          player.newDirection = -1;
       }
       else if(player.oldDirection < player.rotation)
       {
           player.newDirection = 1;
       }
       player.oldDirection = player.rotation;

   

 if(player.hit == 0)
   {
        game.physics.arcade.overlap(enemies, player, playerHit, null, this);
        game.physics.arcade.overlap(player, powerEnemies, playerHit, null, this);
    }
    
    bar.context.clearRect(0,0, bar.width, bar.height);
    bar.context.fillStyle = '#0f0';
    bar.context.fillRect(0,0, barProgress, 8);
    bar.dirty = true;
    
    
   // timeBetweenCollision = game.timer(game);
    //if(timeBetweenCollision > 10)
    //{
    
    game.physics.arcade.collide(enemies);
    game.physics.arcade.collide(enemies, player);
 //   game.physics.arcade.collide(enemies, shield);
    game.physics.arcade.collide(enemies, moveableShield);
    
    
    //////////////////  Buttons ////////////////////
    if (thrustButton.isDown)
    {
       game.physics.arcade.accelerationFromRotation(player.rotation, 500, player.body.acceleration);
       if(player.newDirection == -1)
            emitterLeft.emitParticle();
        else if(player.newDirection == 1)
            emitterRight.emitParticle();
        else if(player.newDirection == 0)
        {
            emitterLeft.emitParticle();
            emitterRight.emitParticle();
        }
        //player.body.velocity.y = -400;
    }
    else
    {
       player.body.acceleration.set(0);
    }
    if(shieldLeft.isDown && shieldRight.isUp && moveableShield.visible === true)
    {
        moveableShield.angle -= 5;
    }
    else if(shieldRight.isDown && shieldLeft.isUp && moveableShield.visible === true)
    {
        moveableShield.angle += 5;
    }
    
    if(spaceKey.isDown && player.bombs > 0)
    {
        dropBomb();
    }
    
    
    /*if(cursors.left.isUp || cursors.right.isUp)
    {
        if (cursors.left.isDown && cursors.right.isUp)
        {
            player.body.angularVelocity = -300;
            emitterLeft.emitParticle();
            if(cursors.right.isDown)
            {
                player.body.angularVelocity = 0;
                emitterRight.emitParticle();
            }
            // player.body.velocity.x = -400;
            // player.scale.x = 1;
        }
        else if (cursors.right.isDown && cursors.left.isUp)
        {
            player.body.angularVelocity = 300;
            emitterRight.emitParticle();
            if(cursors.left.isDown)
            {
                player.body.angularVelocity = 0;
                emitterRight.emitParticle();
            }
            //player.body.velocity.x = 400;
            //   player.scale.x = -1;
        }
        else
        {
            player.body.angularVelocity = 0;
        }
    }*/
    
    if(game.input.activePointer.isDown && player.alive)
    {
         preFire(fireMode);
         
    }
    
   if(player.hit == 1 && player.lives.countLiving() >= 1)
    {
       if(player.flash > 5)
        {
            player.visible = false;
            player.flash = 0;
        }
       else
        {
            player.visible = true;
            ++player.flash;
        }
        
    }
    if(player.hit == 0 && player.visible == false && player.alive)
    {
        player.visible = true;
    }
    
}

function addInventory (player, bombPickup) {
    bombPickup.kill();
    ++player.bombs;
}

function dropBomb () {
    
    if(game.time.now > bombTime)
    {
        bombSprite = game.add.sprite(player.body.x, player.body.y, 'bomb');
        bombSprite.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enableBody(bombSprite);
        bombSprite.immovable = true;
        boomBomb = bombSprite.animations.add('boom');
        bombSprite.animations.play('boom', 12, false);
        bombSprite.lifespan = 5900;
        
         boomBomb.onComplete.add(function() {
            bombSprite.kill();
            bombExplode = game.add.sprite(bombSprite.body.x, bombSprite.body.y, 'playerExplode');
            game.physics.arcade.enableBody(bombExplode);
            bombExplode.anchor.setTo(0.5, 0.5);
            var explode = bombExplode.animations.add('playerBoom');
            bombExplode.animations.play('playerBoom', 15, false);
            explode.onComplete.add(function() {
                bombExplode.kill();
            });
         });
         --player.bombs;
         bombTime = game.time.now + 500;
    }
}

function hitBomb (enemy, bombSprite) {
    console.log("hitBomb!");
    bombSprite.kill();
    bombExplode = game.add.sprite(bombSprite.body.x, bombSprite.body.y, 'playerExplode');
    bombExplode.anchor.setTo(0.5, 0.5);
    var explodeBomb = bombExplode.animations.add('playerBoom');
    bombExplode.animations.play('playerBoom', 15, false);
    
    explodeBomb.onComplete.add(function() {
        bombExplode.kill();
    });
    
    explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);

    var explode = explosion.animations.add('boomExplode');
    explosion.animations.play('boomExplode', 15, true);
    
    explosion.lifespan = 275;
    enemy_death.play();
    enemy.kill();
    
    barProgress = ((waveTotal - enemies.countDead() + offset) * barLength) / waveTotal;
    
    gameComplete();
}

function hitBombExplosion (enemy, bombExplode) {
    console.log("hitBombExplosion");
    explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);

    var explode = explosion.animations.add('boomExplode');
    explosion.animations.play('boomExplode', 15, true);
    
    explosion.lifespan = 275;
    enemy_death.play();
    enemy.kill();
    
    barProgress = ((waveTotal - enemies.countDead() + offset) * barLength) / waveTotal;
    
    gameComplete();
}

function moveShield (player, moveItShield) {
    moveItShield.kill();
    moveableShield.visible = true;
    moveShieldTimer = game.time.events.add(Phaser.Timer.SECOND * 20, removeMoveShield, this);
}

function removeMoveShield () {
    moveableShield.visible = false;
    game.time.events.remove(moveShieldTimer);
}

function shieldPower (player, pickShield) {
    player.hittable = false;
    pickShield.kill();
    shield.visible = true;
    shieldTimer = game.time.events.add(Phaser.Timer.SECOND * 20, removeShield, this);
}

function removeShield () {
    shield.visible = false;
    player.hittable = true;
    game.time.events.remove(shieldTimer);
}

function rotateEnemies(enemy) {
        enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
        enemy.anchor.setTo(0.5, 0.5);
}
    
function render() {
      //a  game.debug.text('Time until event: ' + gameStartTimer.duration.toFixed(0), 32, 32);
   // game.debug.text('Loop Count: ' + totalEnemies, 32, 64);
       //game.debug.spriteInfo(explosion, 32, 32);
//       game.debug.body(player);
 //      game.debug.body(moveableShield);
 //       enemies.forEach(showEnemyBox, this);
   // game.debug.text('Game time now: ' + game.time.now, 32, 32);
}


function getEnSpeed(enemy) {
   if(typeof enemy.inSpeed === 'undefined')
   {
       enemy.inSpeed = game.rnd.integerInRange(200, 260);
   }
   game.physics.arcade.moveToObject(enemy, player, enemy.inSpeed);
    return enemy.inSpeed;
}

function showEnemyBox(enemy) {
    game.debug.body(enemy);
}


    /////////////////// Buttons /////////////////////
    function actionOnClick (){
    
        pausePressed = true;
        
       // create();
        game.paused = true;
    }
    
    function awaitRestart(){
             game.input.onDown.add(restart, self);

    }
    
    function restart(){
        this.game.destroy();
        gameOver = 0;
        fireMode = 1;
        pausePressed = false;
        game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
    }
    
    function up() {
        console.log('button up', arguments);
    }
    
    function over() {
        console.log('button over');
    }
    
    function out() {
        console.log('button out');
    }
    
    //////////////// Main Menu //////////////////////
function showMenu(){
         playButton = game.add.button(gameWidth/2, gameHeight/2 - 200, 'playButton', playClick, this);

   game.paused = true;
   // playButton = game.add.button(gameWidth/2, gameHeight/2, 'playButton');
}

function playClick(){
    //if(game.paused == true){
        game.paused = false;
    //}
    playButton.kill;
}

    

/////////////////// Bullet Functions ///////////////////////
function preFire(fireState){
    switch (fireState)
    {
        case 1:
            singleShot();
            break;
        case 2:
            burstFire();
            break;
        case 3:
            scatterShot();
            break;
        case 4:
            break;
        default:
            singleShot();
        
    }
}


function singleShot(){
    if(game.time.now > bulletTime)
    {
        fireBullet(0);
        bulletTime = game.time.now + 500;
    }
}


function scatterShot(){
    var fireAngle = 0;
    if(game.time.now > bulletTime)
    {
        for(var i = 0; i < 3; i++)
        {
            fireAngle = -15 + (15 * i);
            fireBullet(fireAngle);
        }
        bulletTime = game.time.now + 500;
    }
    
}


function burstFire(){
    var fireAngle = 0;
    if(game.time.now > bulletTime)
    {
        for(var i = 0; i < 3; i++)
        {
            shootTimer = game.time.events.add(70 * i, fireBullet, this, fireAngle);
    
        }
        bulletTime = game.time.now + 600;
    }
}


/*function fireBeam(){
    var fireAngle = 0;
    beam = beams.create(player.x, player.y, 'theBeam');

    var animateBeam = beam.animations.add('animateBeam');
    beam.animations.play('animateBeam', 30, true);
    beam.rotation = player.rotation;
    
}*/


function fireBullet (fireAngle) {

 //   if (game.time.now > bulletTime)
   // {
        bullet = bullets.getFirstExists(false);
        bullet.rotation = player.rotation;
        
        

        if (bullet) 
        {

            bullet.reset(player.x , player.y);
 
            game.physics.arcade.velocityFromAngle(player.angle + fireAngle, 1000, bullet.body.velocity);
            blaster.play();
            //bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);

           // bulletTime = game.time.now + fireRate;
            
        }
  //  }

}


//  Called if the bullet goes out of the screen
function resetBullet (bullet) {

    bullet.kill();

}


/*function beamCollision(beam, enemy){
    var chance = 0;
    
    enemy.kill;
    
    chance = game.rnd.integerInRange(1, 100);
    if(chance < 50){
       power =  powers.create(enemy.body.x, enemy.body.y, 'powerUp');
    }
}*/

function powerBulletCollide(bullet, powerEnemy){
    bullet.kill();
    enemy_death.play();
    explosion = explosions.getFirstExists(false);
    explosion.reset(powerEnemy.body.x, powerEnemy.body.y);
    var explode = explosion.animations.add('boomExplode');
    explosion.animations.play('boomExplode', 15, true);
    explosion.lifespan = 275;
    powers.create(powerEnemy.body.x, powerEnemy.body.y, 'powerUp');
    powerEnemy.kill();
    
}



function collisionHandler (bullet, enemy) {
    var chance = 0;
    bullet.kill();

    explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    
    //explosion = explosions.create(bullet.body.x, bullet.body.y, 'boom1');

    var explode = explosion.animations.add('boomExplode');
    explosion.animations.play('boomExplode', 15, true);
    
   /* chance = game.rnd.integerInRange(1, 100);
    if(chance < 30){
       power =  powers.create(enemy.body.x, enemy.body.y, 'powerUp');
    }*/
    explosion.lifespan = 275;
    enemy_death.play();
    enemy.kill();
    
    barProgress = ((waveTotal - enemies.countDead() + offset) * barLength) / waveTotal;
    
    gameComplete(); // Checks to see if all enemies have been destroyed - If they have, it displays the victory screen
}


function getPowerUp(player, power){
    fireMode = game.rnd.integerInRange(2,3);
    pickup.play();
    power.kill();
}


/////////////////// Life Handler Functions /////////////////////
function playerHit (player, enemy) {
    var lives = player.lives.countLiving();
 /*   if(hittable === false && shield.visible === true)
    {
        removeShield();
        hit = 1;
        hitTimer = game.time.events.add(Phaser.Timer.SECOND * 2.5, resetHit, this); // After 2.5 seconds resethit will be called to stop the
        return;
    }*/
    
    player.hit = 1; // Indicates that the player has been hit
    var lifeHeart = player.lives.getFirstAlive();
    
    if(lifeHeart && player.hittable === true) // If the player has a life, it will be removed
     {
         lifeHeart.kill();
         hitTimer = game.time.events.add(Phaser.Timer.SECOND * 2.5, resetHit, this); // After 2.5 seconds resethit will be called to stop the
         if( lives > 1){
             hitSound.play();
         }
      }
      checkPlayerCollision = 0;
                                                                                
    gameComplete();
}

function gameComplete () {
    var lives = player.lives.countLiving();
    var deadEnemies = enemies.countDead();
    var buttonOffset = 0;
    
    if(deadEnemies == totalEnemies && lives < 1)
    {
        var style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
        var text = game.add.text(gameWidth/2, gameHeight/2, "Totally killing it (from the grave)", style);
        buttonOffset = 110;
    }
    else if(lives < 1)
    {
        var playerDeath = game.add.sprite(player.body.x, player.body.y, 'playerExplode');
         var explode = playerDeath.animations.add('playerBoom');
         explode.onComplete.add(function() {
            playerDeath.kill();
         });
         playerDeath.animations.play('playerBoom', 15);
         player_death.play();
         player.kill();
        
        var overTitle = game.add.sprite((gameWidth/2) - 299, (gameHeight/2) - 174, 'gameOver');
         enemies.setAll('body.velocity.x', 850);
         buttonOffset = 210;
    }
    else if(deadEnemies == totalEnemies)
    {
        var winTitle = game.add.sprite((gameWidth/2) - 355, (gameHeight/2) - 81, 'winTitle');
        buttonOffset = 110;
    }
    if(buttonOffset != 0)
    {
        var reButton = game.add.button(gameWidth/2, gameHeight/2 + buttonOffset, 'restartButton', restart, this, 2, 1, 0);
         reButton.anchor.setTo(0.5, 0.5);
         reButton.hitArea = new Phaser.Rectangle(-100, -11, 220, 60);
         game.time.removeAll();
    }
}

function resetHit () {
    player.hit = 0;
    game.time.events.remove(hitTimer);
}

//////////////////////// Spawn Enemies Functions ///////////////////////

/*function spawnEnemy (itteration, topOrBot){
    
     
    var enemy = enemies.create(gameWidth/4 * itteration, topOrBot, 'enemy');

}*/

function powerMove(){
    sprite = powerEnemies.create(gameWidth/2, 30, 'powerEnemy');
   // var xLocation = game.rnd.integerInRange(-gameWidth/2, gameWidth/2);
        sprite.body.moveTo(7000, gameHeight + 60, 90);

}
function spawnEnemy (x, y){
    enemies.create(x, y, 'enemy');
}




function levelOne(){
    totalEnemies = 55;
    offset = 0;
    //totalEnemies = 3;
    waveTotal = 43;
    spawnTL(3);
    game.time.events.add(3000, powerMove, this);
    spawnBL(3);
    game.time.events.add(6000, spawnBL, this, 3);
    game.time.events.add(6000, spawnBR, this, 3);
    game.time.events.add(9000, powerMove, this);
    game.time.events.add(12000, spawnTL, this, 4);
    game.time.events.add(12000, spawnTR, this, 4);
    game.time.events.add(12000, spawnBM, this, 4);
    game.time.events.add(18000, spawnML, this, 3);
    game.time.events.add(18000, spawnMR, this, 3);
    game.time.events.add(18000, spawnBM, this, 3);
    game.time.events.add(18000, spawnTM, this, 2);
    game.time.events.add(18000, spawnTL, this, 2);
    game.time.events.add(18000, spawnTR, this, 2);
    game.time.events.add(18000, spawnBL, this, 2);
    game.time.events.add(18000, spawnBR, this, 2);
    game.time.events.add(26000, levelTwo, this);
    
}

function levelTwo(){
    waveTotal = 16;
    offset = 43;
    spawnML(2);
    spawnMR(2);
    game.time.events.add(2000, spawnTR, this, 2);
    game.time.events.add(2000, spawnBL, this, 2);
    game.time.events.add(3000, spawnML, this, 2);
    game.time.events.add(3000, spawnMR, this, 2);
    game.time.events.add(4000, spawnBL, this, 2);
    game.time.events.add(4000, spawnTR, this, 2);
}

function powerSpawn(itteration, enemyCount){
   powerEnemies.create(gameWidth/2, 0, 'powerEnemy');
}
{
function spawnTL(enemyCount){
    var x = 0, y = 0;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}

function spawnML(enemyCount){
    var x = 0, y = gameHeight/2;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}
function spawnBL(enemyCount){
    var x = 0, y = gameHeight;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}
function spawnTM(enemyCount){
    var x = gameWidth/2, y = 0;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}
function spawnBM(enemyCount){
    var x = gameWidth/2, y = gameHeight;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}
function spawnTR(enemyCount){
    var x = gameWidth, y = 0;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}
function spawnMR(enemyCount){
    var x = gameWidth, y = gameHeight/2;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}

function spawnBR(enemyCount){
    var x = gameWidth, y = gameHeight;
    
    for(var j = 0; j < enemyCount; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, x, y);
    }
}

}

function countDown(time){
    var style = { font: "bold 64px Arial", fill: "#1dc300", boundsAlignH: "center", boundsAlignV: "middle"};
  //alert("countDown is being called");
    var text = game.add.text(gameWidth/2, gameHeight/2, time);
    text.anchor.setTo(0.5, 0.5);
    text.font = 'Audiowide';
    text.fontSize = 64;
    text.fill = '#000000';
    text.stroke = '#62e308';
    text.strokeThickness = 1;
    text.lifespan = 965;
    game.time.events.add(965, timerSound, this);

}

function timerSound(){
    countSound.play();
}

function muteGame(){
    blaster.mute = true;
    pickup.mute = true;
    player_death.mute = true;
    enemy_death.mute = true;
    countSound.mute = true;
    hitSound.mute = true;
    muteButton.destroy();
    unmuteButton = game.add.button(gameWidth - 45, gameHeight - 100, 'muteButton', unmuteGame, this);
    unmuteButton.hitArea = new Phaser.Rectangle(10, 20, 36, 36);
    unmuteButton.frame = 1;
}

function unmuteGame(){
    blaster.mute = false;
    pickup.mute = false;
    player_death.mute = false;
    enemy_death.mute = false;
    countSound.mute = false;
    hitSound.mute = false;
    unmuteButton.destroy();
    muteButton = game.add.button(gameWidth - 45, gameHeight - 100, 'muteButton', muteGame, this);
    muteButton.hitArea = new Phaser.Rectangle(10, 20, 36, 36);
    muteButton.frame = 0;
}