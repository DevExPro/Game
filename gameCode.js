var gameWidth = window.innerWidth - 100;
var gameHeight = window.innerHeight - 100;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload () {
  game.load.image('background', '../images/back.png');
  game.load.image('bullet', '../images/pewpew2.png');
  game.load.image('fire', '../images/emit.png');
  game.load.image('ship2', '../images/shipGreen.png');
  game.load.spritesheet('boom1', '../images/expolode2.png', 39, 38, 7);
  game.load.image('enemy', '../images/enemyShip2.png');
  game.load.image('heart', '../images/heart.png');
  game.load.image('powerUp', '../images/lightning2.png');
  game.load.spritesheet('theBeam', '../images/laserBeam.png', 40, 16, 11);
  game.load.spritesheet('pauseButton', '../images/pause.png', 36, 36, 2);
}

var bulletTime = 0;
var bullet;
var button;
var explosion;
var player;
var timer;
var powerUp;
var shootTimer;
var gameOver = 0;
var fireMode;
var power;
var beam;
var gameStartTimer;
var totalEnemies;
function create () {
    bakground = game.add.sprite(0, 0, 'background');
    player = game.add.sprite(gameWidth/2, (gameHeight/3)*2, 'ship2');
    
    /////////////// Pause Button ////////////////////
    button = game.add.button(gameWidth - 45, gameHeight - 45, 'pauseButton', actionOnClick, this, 2, 1, 0);
    button.anchor.setTo(0.5, 0.5);
    button.onInputOver.add(over, this);
    button.onInputOut.add(out, this);
    button.onInputUp.add(up, this);
    
    game.input.onDown.add(unpause, self);

    function unpause(event){
        if(game.paused){
            game.paused = false;
        }
    }



  ///////////////// Player Lives Section ///////////
    lives = game.add.group();
    life = lives.create(gameWidth - 51, 5, 'heart');
    life = lives.create(gameWidth - 34, 5, 'heart');
    life = lives.create(gameWidth - 17, 5, 'heart');


  ////////////////// Emitter section //////////////////
    game.physics.arcade.enableBody(player);
    emitterLeft = game.add.emitter(0, 0, 1000);
    emitterRight = game.add.emitter(0, 0, 1000);
    emitterLeft.makeParticles('fire');
    emitterRight.makeParticles('fire');
    player.addChild(emitterLeft);
    player.addChild(emitterRight);
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

    levelOneTimer.start();
    
  ////////////// Player Attributes Sction /////////////////
    hit = 0;
    flashPlayer = 0;

    //game.camera.follow(player);
    cursors = game.input.keyboard.createCursorKeys();
    //game.physics.arcade.enable(player);
    game.world.setBounds(0, 0, gameWidth, gameHeight);
   
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);
    player.body.drag.set(55);
    player.body.maxVelocity.set(300);
   
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
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
   
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
    
    ///////////////// The Bar /////////////////////////////
    barLength = gameWidth/3;
    barProgress = barLength;
    
   /* backRect = new Phaser.Rectangle((gameWidth / 2) - (barLength /2) - 8, gameHeight - 58, (gameWidth/3) + 16, 24);
    topRect = new Phaser.Rectangle((gameWidth / 2) - (barLength /2) - 7, gameHeight - 57, (gameWidth/3) + 14, 22);
    game.debug.geom(backRect, '#0f0');
       game.debug.geom(topRect, '#000');*/
       
    backRect = this.add.bitmapData((gameWidth/3) + 8, 16);
    topRect = this.add.bitmapData((gameWidth/3) + 6, 14);
    game.add.sprite((gameWidth / 2) - (barLength /2) - 4, gameHeight - 54, backRect);
    game.add.sprite((gameWidth / 2) - (barLength /2) - 3, gameHeight - 53, topRect);
    
    backRect.context.fillStyle = '#0f0';
       topRect.context.fillStyle = '#000';
       backRect.context.fillRect(0, 0, (gameWidth/3) + 8, 16);
       topRect.context.fillRect(0, 0, (gameWidth/3) + 6, 14);
       
       
    
    bar = this.add.bitmapData(barLength, 8);
    game.add.sprite((gameWidth/2) - (barLength /2), gameHeight - 50, bar);
    game.add.tween(this).to({barProgress: 0}, 2000, null, true, 0, Infinity);
    
    
   
}

function update () {
   game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
   game.physics.arcade.overlap(player, powers, getPowerUp, null, this);
   //game.physics.arcade.overlap(beams, enemies, beamCollision, null, this);


   // enemies.rotation = game.physics.arcade.moveToObject(enemies, 1000, player, 500);
   enemies.forEach(game.physics.arcade.moveToObject, game.physics.arcade, false, player, 150);
   
  //   enemies.forEach(this.rotation = this.game.physics.arcade.angleBetween, game.physics.arcade, false, player); //(enemy, player);
  
  if(hit == 0) // If it has been more than 2.5 seconds since the player was last hit 
   {
        game.physics.arcade.overlap(enemies, player, playerHit, null, this);
    }
  


   bar.context.clearRect(0,0, bar.width, bar.height);
   if(barProgress < barLength/4) {
       bar.context.fillStyle = '#f00';
   }
   else if(barProgress <barLength/2) {
       bar.context.fillStyle = '#ff0';
   }
   else {
        bar.context.fillStyle = '#0f0';
   }
    bar.context.fillRect(0,0, barProgress, 8);
    bar.dirty = true;
    
    
   // timeBetweenCollision = game.timer(game);
    //if(timeBetweenCollision > 10)
    //{
    
    game.physics.arcade.collide(enemies);
    game.physics.arcade.collide(enemies, player);
    
    
    //////////////////  Buttons ////////////////////
    if (cursors.up.isDown)
    {
       game.physics.arcade.accelerationFromRotation(player.rotation, 300, player.body.acceleration);
       emitterLeft.emitParticle();
       emitterRight.emitParticle();
        //player.body.velocity.y = -400;
    }
    else
    {
       player.body.acceleration.set(0);
    }
    if(cursors.left.isUp || cursors.right.isUp)
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
    }
    
    if(fireButton.isDown && gameOver != 1)
    {
         preFire(fireMode);
    }
    
   if(hit == 1 && lives.countLiving() >= 1)
    {
       if(flashPlayer > 5)
        {
            player.visible = false;
            flashPlayer = 0;
        }
       else
        {
            player.visible = true;
            ++flashPlayer;
        }
        
    }
    
}
    
function render() {
        game.debug.text('Time until event: ' + gameStartTimer.duration.toFixed(0), 32, 32);
   // game.debug.text('Loop Count: ' + totalEnemies, 32, 64);
       //game.debug.spriteInfo(explosion, 32, 32);

}


    /////////////////// Buttons /////////////////////
    function actionOnClick (){
        game.paused = true;
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
 
            game.physics.arcade.velocityFromAngle(player.angle + fireAngle, 900, bullet.body.velocity);
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


function collisionHandler (bullet, enemy) {
    var chance = 0;
    bullet.kill();

    explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    
    //explosion = explosions.create(bullet.body.x, bullet.body.y, 'boom1');

    var explode = explosion.animations.add('boomExplode');
    explosion.animations.play('boomExplode', 15, true);
    
    chance = game.rnd.integerInRange(1, 100);
    if(chance < 50){
       power =  powers.create(enemy.body.x, enemy.body.y, 'powerUp');
    }
    explosion.lifespan = 275;

    enemy.kill();
    
    barProgress = ((totalEnemies - enemies.countDead()) * barLength) / totalEnemies;

    if(enemies.countDead() == totalEnemies)
    {
        style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
        text = game.add.text(0, 0, "Wiiiiinnnner", style);
    }
}


function getPowerUp(player, power){
    fireMode = game.rnd.integerInRange(2,3);
    power.kill();
}


/////////////////// Life Handler Functions /////////////////////
function playerHit (player, enemy) {
    hit = 1; // Indicates that the player has been hit
    var lifeHeart = lives.getFirstAlive();
    
    if(lifeHeart) // If the player has a life, it will be removed
     {
         lifeHeart.kill();
            console.log("Player still has a life");
         hitTimer = game.time.events.add(Phaser.Timer.SECOND * 2.5, resetHit, this); // After 2.5 seconds resethit will be called to stop the
      }                                                                                                                  // player from flashing
      else {
         // player.tint = '#ff0';
         console.log("OH Nooooooo, player has no more lives");
      }
                                                                                
 /*     if(lives.countLiving() < 1) // If the player has no more lives remaining, kill the player, and indicate the end of the game
     {
      player.kill();
      gameOver = 1;
      style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
      text = game.add.text(0,0, "GAME OVER", style);
     }*/
}


function resetHit () {
    hit = 0;
    console.log("Reseting playerHit timer");
    game.time.events.remove(hitTimer);
}

//////////////////////// Spawn Enemies Function ///////////////////////

function spawnEnemy (itteration){

   
    var enemy = enemies.create(gameWidth/4 * itteration, 0, 'enemy');

}

function levelOne(){
    totalEnemies = 15;
    for(var i = 0; i < 3; i++){
        game.time.events.add(5000 * i, spawnFive, this, i + 1);
    }
}

function spawnFive(itteration){
    for(var j = 0; j < 5; j++)
    {
        game.time.events.add(500 * j, spawnEnemy, this, itteration);
    }
}

function countDown(time){
    var style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
  //alert("countDown is being called");
    var text = game.add.text(gameWidth/2, gameHeight/2, time, style);
    text.lifespan = 965;

}