

// Cloned by Cian sullivan on 26 Nov 2022 from World "Simple  World" by Starter user 
// Please leave this clone trail here.
 


// ==== Starter World =================================================================================================
// This code is designed for use on the Ancient Brain site.
// This code may be freely copied and edited by anyone on the Ancient Brain site.
// To include a working run of this program on another site, see the "Embed code" links provided on Ancient Brain.
// ====================================================================================================================


// ==========================================================================
// Simple starter World 
// 3d-effect World (really a 2-D problem)
//
// Hero = agent = pacman. 
// Enemy moves randomly.
// Movement is on an invisible grid of squares 
//
// This simple World shows:
// - Texture load from files (asynchronous file reads)
// - Write status to <span> in run window
//
// It also shows functionality that is built-in to every World:
// - Camera control buttons  
// - Pause/step run
// ==========================================================================


// =============================================================================================
// Scoring:
// Bad steps = steps where enemy is within one step of agent.
// Good steps = steps where enemy is further away. 
// Score = good steps.
// =============================================================================================






// ===================================================================================================================
// === Start of tweaker's box ======================================================================================== 
// ===================================================================================================================

// The easiest things to modify are in this box.
// You should be able to change things in this box without being a JavaScript programmer.
// Go ahead and change some of these. What's the worst that could happen?


AB.clockTick       = 5;    

	// Speed of run: Step every n milliseconds. Default 100.
	
AB.maxSteps        = 1000;    

	// Length of run: Maximum length of run in steps. Default 1000.

AB.screenshotStep  = 50;   
  
	// Take screenshot on this step. (All resources should have finished loading.) Default 50.



//---- global constants: -------------------------------------------------------

 const TEXTURE_WALL 	= '/uploads/ciansullivan1/tile1.png' ;
 const TEXTURE_AGENT 	= '/uploads/starter/pacman.jpg' ;
 
// credits:
// http://commons.wikimedia.org/wiki/File:Old_door_handles.jpg
// https://commons.wikimedia.org/wiki/Category:Pac-Man_icons
// https://commons.wikimedia.org/wiki/Category:Skull_and_crossbone_icons


const gridsize 		= 10;							// number of squares along side of world	   
const squaresize 	= 100;							// size of square in pixels
	
const SKYCOLOR 		= 0xffffcc;						// a number, not a string 

const MAXPOS 		= gridsize * squaresize;		// length of one side in pixels 

const startRadiusConst	 	= MAXPOS * 0.8 ;		// distance from centre to start the camera at
const maxRadiusConst 		= MAXPOS * 3 ;			// maximum distance from camera we will render things  



//--- change ABWorld defaults: ----------------------------------------------

ABHandler.GROUNDZERO		= true;						// "ground" exists at altitude zero


// ===================================================================================================================
// === End of tweaker's box ==========================================================================================
// ===================================================================================================================


// You will need to be some sort of JavaScript programmer to change things below the tweaker's box.











// in initial view, (smaller-larger) on i axis is aligned with (left-right)
// in initial view, (smaller-larger) on j axis is aligned with (away from you - towards you)


 

var GRID 	= new Array(gridsize);			// can query GRID about whether squares are occupied, will in fact be initialised as a 2D array   

var theagent;	  

var wall_texture, agent_texture;

// enemy and agent position on squares
var ax, ay;

var badsteps;
var goodsteps;

var randomNum;
var testVar;




	
function loadResources()		// asynchronous file loads - call initScene() when all finished 
{
	var loader1 = new THREE.TextureLoader();
	var loader2 = new THREE.TextureLoader();
	
	loader1.load ( TEXTURE_WALL, function ( thetexture )  		
	{
		thetexture.minFilter  = THREE.LinearFilter;
		wall_texture = thetexture;
		if ( asynchFinished() )	initScene();		// if all file loads have returned 
	});
		
	loader2.load ( TEXTURE_AGENT, function ( thetexture )  	 
	{
		thetexture.minFilter  = THREE.LinearFilter;
		agent_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});	
	
}


function asynchFinished()		 
{
	if ( wall_texture && agent_texture )   return true; 
	else return false;
}	
	



//--- grid system -------------------------------------------------------------------------------
// my numbering is 0 to gridsize-1

	
function snakeSquare ()		// is this square occupied
{
  var hit = 0;

  if ( (ax === 6) && (ay === 9) ) 
  {
    ax=ax-3;
    hit = 1;
  } 

 
  if ( hit == 1 )
  {
    AB.msg(` <hr> <p> Oh No! You rolled ` + randomNum + `, and landed on a Snake Square! <p>
    ` + `Ax is ` + ax + ` Ay is ` + ay + ` <p>
    Click roll to roll dice. <p>
  	<button onclick='roll();'  class=ab-largenormbutton > Roll </button> <p>` );
    drawAgent();
  }

  else
  {
    AB.msg(` <hr> <p> You rolled ` + randomNum + `! <p>` +
    `Ax is ` + ax + ` Ay is ` + ay + `<p>` +
    ` Click roll to roll dice. <p> 
  	<button onclick='roll();'  class=ab-largenormbutton > Roll </button> <p>` );
  }

  drawAgent();
  
}

 
// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates
// logically, coordinates are: y=0, x and z all positive (no negative)    
// logically my dimensions are all positive 0 to MAXPOS
// to centre everything on origin, subtract (MAXPOS/2) from all dimensions 

function translate ( i, j )			
{
	var v = new THREE.Vector3();
	
	v.y = 0;	
	v.x = ( i * squaresize ) - ( MAXPOS/2 );   		 
	v.z = ( j * squaresize ) - ( MAXPOS/2 ); 

	
	return v;
}



	
function initScene()		// all file loads have returned 
{
	 var i,j, shape, thecube;
	 
	// set up GRID as 2D array
	// GRID = new Array(gridsize);
	// now make each element an array 
	 
	 for ( i = 0; i < gridsize ; i++ ) 
		GRID[i] = new Array(gridsize);		 


	// set up board
	 
	 for ( i = 0; i < gridsize ; i++ ) 
	  for ( j = 0; j < gridsize ; j++ ) 
		{
			GRID[i][j] = true;		 
			shape    = new THREE.BoxGeometry ( squaresize, squaresize, squaresize );			 
			thecube  = new THREE.Mesh( shape );
			thecube.material = new THREE.MeshBasicMaterial( { map: wall_texture } );
			
			
			thecube.position.copy ( translate(i,j) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 
			ABWorld.scene.add(thecube);
		}

  
	
	
   // set up agent 
   // start at same place every time:
   
	 ax = 0;		// this square will be free 
	 ay = 9;

	 shape    = new THREE.BoxGeometry ( squaresize, squaresize, squaresize );			 
	 theagent = new THREE.Mesh( shape );
	 theagent.material =  new THREE.MeshBasicMaterial( { map: agent_texture } );
	 ABWorld.scene.add(theagent);
	 drawAgent(); 	

 
  // can start the run loop
  
	ABWorld.render();		
  
  	AB.runReady = true;
  	
  	  	AB.msg ( ` <hr> <p> Multi-user game. Click roll to roll dice. Drag the camera. <p>
  	        <button onclick='roll();'  class=ab-largenormbutton > Roll </button> <p> ` );	
}


function roll()
{    
    moveLogicalAgent();
}
 


// --- draw moving objects -----------------------------------

function drawAgent()		// given ai, aj, draw it 
{
    // AB.msg(' getting in ');
    // AB.msg(ax + ' ' + ay);
	theagent.position.copy ( translate(ax,ay) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 

	ABWorld.follow.copy ( theagent.position );			// follow vector = agent position (for camera following agent)
}




// --- take actions -----------------------------------



function moveLogicalAgent()			// this is called by the infrastructure that gets action a from the Mind 
{ 
  var min = Math.ceil(0);
  var max = Math.floor(7);
  randomNum = Math.floor(Math.random() * (max - min) + min);
  //randomNum = 6
  
  AB.msg ( ` <hr> <p> Multi-user game. Click roll to roll dice. Drag the camera. <p>
  	        <button onclick='roll();'  class=ab-largenormbutton > Roll </button> <p> 
  	        You rolled ` + randomNum + `!` + ax + ' ' + ay);


    if (ay == 8 || ay == 6 || ay == 8 || ay == 2 || ay === 0)
    {
        if ( (ax - randomNum) < 0)
        {
                ay = ay - 1;
        
                ax = ax - randomNum;
                if (ax < 0)
                {
                    ax = ax * -1;
                }
                ax = ax - 1;
        }

        else

        ax = ax - randomNum;
    }

    else
    {
        if ( (ax + randomNum) >= 10)
        {
            ay = ay - 1;
    
            testVar = (10 - ax);
            ax = (randomNum - testVar);
            Math.abs(ax);
            ax = ((10 - ax) - 1);
        }
        else
        {
            ax = ax + randomNum;
        }

    }

    drawAgent();
    snakeSquare();

    
}



// --- score: -----------------------------------


 
function   updateStatus()		 
{
 var score = AB.world.getScore();
 AB.msg ( " Step: " + AB.step + " out of " + AB.maxSteps + ". Score: " + score );
 
 AB.msg ( ` <hr> <p> Multi-user game. Pick a side. Click buttons to change boxes on all users' machines. Drag the camera. <p>
  	        <button onclick='baby();'  class=ab-largenormbutton > Baby </button>  
            <button onclick='skull();'  class=ab-largenormbutton > Skull </button> <p> ` );	
}




AB.world.newRun = function() 
{
	AB.runReady = false;  

	badsteps = 0;		
	goodsteps = 0;

	ABWorld.init3d ( startRadiusConst, maxRadiusConst, SKYCOLOR  ); 

	loadResources();		// aynch file loads		
							// calls initScene() when it returns 	 
};



AB.world.getState = function()
{
	var x = [ ax, ay, ei, ej ];
	return ( x );  
};


// AB.world.takeAction = function ( a )
// {
//   moveLogicalAgent(a);
  

//   if ( badstep() )  badsteps++;
//   else   			goodsteps++;

//   drawAgent();
//   updateStatus();
// };



AB.world.getScore = function()
{
 return goodsteps;
};






