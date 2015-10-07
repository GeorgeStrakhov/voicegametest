// Initialize Phaser, and creates a 400x490px game

var game = new Phaser.Game(900, 490, Phaser.AUTO, 'gameDiv');

var map = function ( num, in_min , in_max , out_min , out_max ) {
  return ( num - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
};

var voice = new Wad({source : 'mic' }); // At this point, your browser will ask for permission to access your microphone.
var tuner = new Wad.Poly();
tuner.add(voice);
tuner.updatePitch();

// Creates a new 'main' state that will contain the game
var mainState = {

    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the bird sprite
        game.load.image('bird', 'assets/bird.png');  

        // Load the pipe sprite
        game.load.image('pipe', 'assets/pipe.png');      
    },

    // Fuction called after 'preload' to setup the game 
    create: function() { 
        voice.play();
        tuner.updatePitch();
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 200, 'bird');
        
        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        //this.bird.body.gravity.y = 1000; 

        //var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        //upKey.onDown.add(this.goUp, this);
        //downKey.onDown.add(this.goDown, this);
        //spaceKey.onDown.add(this.jump, this); 

        // Create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(50, 'pipe');  

        // Timer that calls 'addRowOfPipes' ever 1.5 seconds
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        // Add a score label on the top left of the screen
        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        /*
        if (this.bird.inWorld == false)
            this.restartGame(); 
        */

        // If the bird overlap any pipes, call 'restartGame'
        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);      

        //update the position.
        this.bird.body.velocity.y = 0;
        //console.log(this.bird.body.y); //'y' coordinate range from 0 (top) to 444 (bottom);
        //console.log(tuner.pitch); // with my voice pitch ranges from about 600 to about 2100;
        if(!tuner.pitch) return
        var yPos = map(tuner.pitch, 150, 500, 444, 0);
        if(yPos < 0 || yPos > 444) return;
        this.bird.body.y = yPos; 
        /*
        if(this.upKey.isDown) {
          this.goUp();
        }
        if(this.downKey.isDown) {
          this.goDown();
        }
        */
    },

    goUp: function() {
      this.bird.body.velocity.y = -200;
    },

    goDown: function() {
      this.bird.body.velocity.y = 200;
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        alert('Too bad! Start again.');
        this.bird.body.y = 200;
        game.state.start('main');
    },

    // Add a pipe on the screen
    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 
               
        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    // Add a row of 6 pipes with a hole somewhere in the middle
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1 && i != hole+2) 
                this.addOnePipe(900, i*60+10);   
    
        this.score += 1;
        this.labelScore.text = this.score;  
    },
};

// Add and start the 'main' state to start the game
var gogo = function() {
  game.state.add('main', mainState);  
  game.state.start('main'); 
};
