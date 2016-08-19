var gameWidth = window.innerWidth - 100;
var gameHeight = window.innerHeight - 100;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload () {
  game.load.image('background', '../images/back.png');
  game.load.image('bullet', '../images/pewpew2.png');
  game.load.image('fire', '../images/emit.png');
  game.load.image('ship2', '../images/shipGreen.png');
  game.load.spritesheet('boom1', '../images/boom2.png', 32, 32, 5);
  game.load.image('enemy', '../images/enemyShip2.png');
  game.load.image('heart', '../images/heart.png');
  game.load.image('powerUp', '../images/lightning2.png');
  game.load.spritesheet('theBeam', '../images/laserBeam.png', 40, 16, 11);
}

var bulletTime = 0;
var bullet;
var explosion;
var player;
var timer;
var powerUp;
var shootTimer;
var gameOver = 0;
var fireMode;
var power;
var beam;

function create () {
    bakground = game.add.sprite(0, 0, 'background');
    player = game.add.sprite(gameWidth/2, (gameHeight/3)*2, 'ship2');


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
    var totalEnemies = 5;

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    enemies.setAll('body.collideWorldBounds', true);
    for(j = 0; j < totalEnemies; j++)
    {
        spawnTimer = game.time.events.add(500 * j, spawnEnemy, this);
    }

    
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

    
    for (var i = 0; i < 200; i++)
    {
        var b = bullets.create(0, 0, 'bullet');
        b.name = 'bullet' + i;
       // b.anchor.setTo(-.9, 0.5);
        b.anchor.setTo(-.9, 0.5);
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

  ////////////////// Powers ////////////////////////////////
    powers = game.add.group();
    powers.enableBody = true;
    powers.physicsBodyType = Phaser.Physics.ARCADE;
   
}

function update () {
   game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
   game.physics.arcade.overlap(player, powers, getPowerUp, null, this);
   //game.physics.arcade.overlap(beams, enemies, beamCollision, null, this);


   // enemies.rotation = game.physics.arcade.moveToObject(enemies, 1000, player, 500);
   enemies.forEach(game.physics.arcade.moveToObject, game.physics.arcade, false, player, 150);
   
  //   enemies.forEach(this.rotation = this.game.physics.arcade.angleBetween, game.physics.arcade, false, player); //(enemy, player);

    
   // timeBetweenCollision = game.timer(game);
    //if(timeBetweenCollision > 10)
    //{
    if(hit == 0) // If it has been more than 2.5 seconds since the player was last hit 
    {
        game.physics.arcade.overlap(enemies, player, playerHit, null, this);
    }
    
    game.physics.arcade.collide(enemies);
    game.physics.arcade.collide(player);
    
    
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
        //    game.debug.text('Time until event: ' + shootTimer.duration.toFixed(0), 32, 32);
   // game.debug.text('Loop Count: ' + totalEnemies, 32, 64);
       //game.debug.spriteInfo(explosion, 32, 32);

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
            fireBeam();
            break;
        default:
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
 
            game.physics.arcade.velocityFromAngle(player.angle + fireAngle, 750, bullet.body.velocity);
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

    
    explosion = game.add.sprite(bullet.body.x, bullet.body.y, 'boom1');
    explosion.anchor.setTo(0.5, 0.5);
    //explosion = explosions.create(bullet.body.x, bullet.body.y, 'boom1');

    var explode = explosion.animations.add('boom');
    explosion.animations.play('boom', 20, true);
    
    chance = game.rnd.integerInRange(1, 100);
    if(chance < 50){
       power =  powers.create(enemy.body.x, enemy.body.y, 'powerUp');
    }
    explosion.lifespan = 30;

    enemy.kill();

    if(enemies.countDead() == 5)
    {
        style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"};
        text = game.add.text(0,0, "Wiiiiinnnner", style);
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
         console.log("Removing a life");
         lifeHeart.kill();
     
         hitTimer = game.time.events.add(Phaser.Timer.SECOND * 2.5, resetHit, this); // After 2.5 seconds resethit will be called to stop the
      }                                                                                                                  // player from flashing
      else {
          console.log("No more lives!");
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
    console.log("2.5 Seconds up");
    game.time.events.remove(hitTimer);
}

//////////////////////// Spawn Enemies Function ///////////////////////

function spawnEnemy (){
        var enemy = enemies.create(1000, 0, 'enemy');

}