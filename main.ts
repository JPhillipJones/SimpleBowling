//Classes
class Frame {
    constructor(public roll1: number, public roll2: number, public roll3: number, public type: string, public score:number) {};
}

class Ball {
    constructor(
        public X:number, 
        public Y:number, 
        public R:number, 
        public angle:number, 
        public ocillate:number, 
        public rolling: boolean) {};
}

class Pin {
    constructor(public X:number, public Y:number, public R:number,public upRight:boolean) {};
}

class Game{
    constructor(
          public state: string,
          public score:number,
          public frame:number,
          public previousFrame:number,
          public roll:number,
          public display:string,
          public speed:number //in milliseconds 
    ){};

    public incrementFrame(){
        this.frame++;
        this.previousFrame++;
        this.roll = 1;
    }
}

var canvas = <HTMLCanvasElement> document.getElementById("theCanvas");
canvas.addEventListener('click', canvasClicked, false);
var ctx = canvas.getContext("2d");
var game = new Game("start",0,1,0,1,"Click to Start!",30);
var theFrames:Frame[] = setupFrames();
var thePins: Pin[] = setupPins();
var theBall = new Ball(100,460,30,0,1,false);
let gameLoop = setInterval(gameUpdate, game.speed);

//main loop function and setup
function gameUpdate(){
    if(game.state==="running"){
         clearCanvas();
         if(!theBall.rolling){
             ocillateBall(theBall);
         }else{
             rollBall()
         }
         drawPins(thePins);
         drawBall(theBall);        
         calculateScore();
         renderScoresTable(theFrames);
         setScore(game.score);
    }else{
        if(game.state ==="over"){
         renderScoresTable(theFrames);
        }
    }
 }

 function setUp(){   
    //first run test data from excercise and log score to console
    runTestData();

    game.frame=1;game.roll=1;game.previousFrame=0;game.score=0;
    setScoreHeader("Score: ");
    resetFrames(theFrames);     
    resetPins();   
    clearCanvas();
    drawPins(thePins);
    drawBall(theBall); 
}

//Score Calculation and Frame Control
function calculateScore(){
    
    var score: number = 0;
    //total pins first
    var i:number;    
    for(i=1; i<=game.frame;i++){
        var f = theFrames[i] 
        f.score = (f.roll1+f.roll2+f.roll3);    
        //Add values from subsequent frames if we are not on the last one since those rolls are simply summed
        if(i < 10){
        //spare        
        if(isSpare(f)){
            f.score += getNextRoll(i);
        }

        //strike
        if(isStrike(f)){
            f.score += getNextRoll(i);   
            f.score += getRollAfterNext(i);         
        }
    }
        score += f.score;  
    }   
    game.score = score;
} 

function advanceFrameAndRoll(){    
    var currentFrame:Frame = theFrames[game.frame];
    //FRAMES 1-9 Scenarios

        //strike
        if(!isTenthFrame() && isFirstRoll() && isStrike(currentFrame)){
            currentFrame.type = "strike"; 
            game.incrementFrame();
            resetPins();
            updateDisplayForFrame();
            return;
        }
        //non-strike
        if(!isTenthFrame() && isFirstRoll() && !isStrike(currentFrame)){
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //spare
        if(!isTenthFrame() && isSecondRoll() && isSpare(currentFrame) ){
            currentFrame.type = "spare";
            game.incrementFrame();
            resetPins();
            updateDisplayForFrame();
            return;
        }
        //non-spare
        if(!isTenthFrame() && isSecondRoll() && !isSpare(currentFrame) ){
            game.incrementFrame();
            resetPins();
            updateDisplayForFrame();
            return;
        }

    //TENTH FRAME Scenarios
         //strike
         if(isTenthFrame() && isFirstRoll() && isStrike(currentFrame)){
            currentFrame.type = "strike"; 
            resetPins();
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //non-strike
        if(isTenthFrame() && isFirstRoll() && !isStrike(currentFrame)){
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //double-strike
        if(isTenthFrame() && isSecondRoll() && isDoubleStrike(currentFrame)){
            currentFrame.type = "strike";
            resetPins();
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //spare
        if(isTenthFrame() && isSecondRoll() && isSpare(currentFrame)){
            currentFrame.type = "spare";
            resetPins();
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //non-spare or double-strike but first roll was strike
        if(isTenthFrame() && isSecondRoll() && !isSpare(currentFrame) && isStrike(currentFrame) && !isDoubleStrike(currentFrame)){
            currentFrame.type = "spare";
            
            game.roll++;
            updateDisplayForFrame();
            return;
        }
        //non-spare or strike on first roll
        if(isTenthFrame() && isSecondRoll() && !isSpare(currentFrame) && !isStrike(currentFrame)){
            gameOver();
            return;
        }
        //Third Roll
        if(isTenthFrame() && isThirdRoll() ){
            gameOver();
            return;
        }       
        
        

}

//Utility
function updateDisplayForFrame(){
    setDisplay("Frame: " + (game.frame).toString() + " Roll: " + game.roll.toString()); 
}

function isTenthFrame(){
    return (game.frame >9);
}

function isFirstRoll(){
    return (game.roll == 1);
}

function isSecondRoll(){
    return (game.roll == 2);
}

function isThirdRoll(){
    return (game.roll == 3);
}

function isSpare(frame: Frame){
 return (frame.roll1<10 && (frame.roll1+frame.roll2) >9);
}

function isStrike(frame: Frame){
    return (frame.roll1 > 9);
}

function isDoubleStrike(frame: Frame){
    return (frame.roll1 > 9 && frame.roll2 > 9);
}
   
function getNextRoll(index: number){   
    return theFrames[index+1].roll1;
}

function getRollAfterNext(index: number){
    var nextFrame:Frame = theFrames[index+1];
    if(isStrike(nextFrame) && index < 9){
        return theFrames[index+2].roll1;
    }else{
        return  theFrames[index+1].roll2;
    }

}

function setupFrames(){
    var frames:Frame[] = []
    //adding start frame to zero slot or we can work with slots 1-10 without confusion
    frames.push(new Frame(0,0,0,"start",0)); 
    //Setup 10 pins and 10 frames
    var i:number;
    for(i=0; i<10;i++){
        frames.push(new Frame(0,0,0,"split",0));                       
       }
    return frames;       
}

function resetFrames(frames: Frame[]){
   frames.forEach(function(f){
    f.roll1=0;f.roll2=0;f.roll3=0;f.score=0;f.type="split";
   });
}

function setupPins(){
    var pins:Pin[] = [];
    var i:number;
    for(i=0; i<10;i++){        
        switch(true){
            case (i<4):
                pins.push(new Pin(0,20,20,true));
                break;
            case (i>=4 && i < 7):
                pins.push(new Pin(0,55,20,true));
                break;
            case (i >=7 && i < 9):
                pins.push(new Pin(0,90,20,true));
                break;
            case (i >= 9):
                pins.push(new Pin(0,125,20,true));
                break;   
        }
    }
    pins[0].X =25;pins[1].X =75;pins[2].X =125;pins[3].X =175;
    pins[4].X =50;pins[5].X =100;pins[6].X =150;  
    pins[7].X =75;pins[8].X =125;
    pins[9].X =100;

    return pins;
}


function rollBall(){
    if(theBall.Y > -50){
        theBall.Y -=7;
        checkCollision(theBall, thePins);
    }else{
        var currentFrame = game.frame;
        theBall.Y = 460;
        theBall.rolling = false;        
        advanceFrameAndRoll();
        //check to see if we need to reset the pins
        if(game.frame > currentFrame){
            resetPins();
        }
    }
    
}

function resetPins(){
    thePins.forEach(function(p){
        p.upRight = true;
    })
}

function checkCollision(ball: Ball, pins: Pin[])
{
    pins.forEach(function(p){        
        if(p.upRight){
            //first let's check to see if the call is in the "strike zone"
            if(ball.Y < (p.Y + 50) && ball.X < 110 && ball.X > 90){
                p.upRight = false;
                totalPins();
                if(game.roll < 2){
                    setDisplay("It's a STRIKE!!!")                   
                }
            }else
            {
                if(ball.Y < (p.Y + 50) && ball.X < (p.X + 50) && ball.X > (p.X - 35)){
                    p.upRight = false;
                    totalPins();
                }
            }  
        }

    });
}

function totalPins(){
    
    switch(game.roll){
        case 1:
            theFrames[game.frame].roll1++;
            break;
        case 2:
            theFrames[game.frame].roll2++;
            break;
        case 3:    
            theFrames[game.frame].roll3++;
            break;                          
    }
}

function gameOver(){
    game.state = "over";
    setDisplay("Game Finished!");
    setScoreHeader("Final Score: ");
    setInstructions("Click to Play Again")

}

//Interaction
function canvasClicked(){
    if(game.state === "running"){
        theBall.rolling = true;
    }else{
        setUp();
        game.state = "running"
        setDisplay("Frame: " + (game.frame).toString() + " Roll: " + game.roll.toString());
        setInstructions("Click to Roll Ball");
    }

}

//Visuals and Graphics Work

function clearCanvas(){
    ctx!.clearRect(0, 0, 200, 500);
}

function ocillateBall(ball: Ball){
    if(ball.X > 165){
        ball.ocillate = -1;
    }
    if(ball.X < 30){
        ball.ocillate = 1;
    }

    ball.X += (ball.ocillate * 5);
}

function drawBall(ball: Ball)
{
    ctx!.beginPath();
    ctx!.fillStyle = "#000000";
    ctx!.arc(ball.X, ball.Y, ball.R, 0, 15);
    ctx!.fill();

}

function drawPins(pins: Pin[]){
    pins.forEach(function(p){
     if(p.upRight){   
     ctx!.beginPath();
     ctx!.arc(p.X, p.Y, p.R, 0, 15);
     ctx!.stroke();
     ctx!.beginPath();
     ctx!.arc(p.X, p.Y, p.R - 8, 0, 15);
     ctx!.stroke();
     }else{
         ctx!.beginPath();
         ctx!.moveTo(p.X-15,p.Y-15)
         ctx!.lineTo(p.X+15,p.Y+15)
         ctx!.stroke();       
         ctx!.beginPath();
         ctx!.moveTo(p.X+15,p.Y-15)
         ctx!.lineTo(p.X-15,p.Y+15)
         ctx!.stroke();       
     }
    });
 }

 function renderScoresTable(frames: Frame[]){
    let container = document.getElementById("scoresContainer");
    container!.removeChild(container!.childNodes[0]);
    var i:number;   
    var table = document.createElement("table");
    var headerRow = table.insertRow();
    var frameHeader = headerRow.insertCell();
    frameHeader.innerText = "Frame";
    var roll1Header = headerRow.insertCell();
    roll1Header.innerText = "Roll #1";
    var roll2Header = headerRow.insertCell();
    roll2Header.innerText = "Roll #2";
    var roll3Header = headerRow.insertCell();
    roll3Header.innerText = "Roll #3";
    var frameScoreHeader = headerRow.insertCell();
    frameScoreHeader.innerText = "Score";
    var resultHeader = headerRow.insertCell();    
    resultHeader.innerText = "Result";    

    for(i=1; i<11;i++){
      var row = table.insertRow();
      var frameNumber = row.insertCell();
      frameNumber.innerHTML = i.toString();
      var roll1 = row.insertCell();
      var roll2 = row.insertCell();
      var roll3 = row.insertCell();
      var frameScore = row.insertCell();
      var frameResult = row.insertCell();
      if(i <= game.frame){      
        roll1.innerText = frames[i].roll1.toString();
        roll2.innerText = frames[i].roll2.toString();
        if(i>0){
            roll3.innerText = frames[i].roll3.toString();
        }
        frameScore.innerText = frames[i].score.toString();
      }
      
      if (i < game.frame || game.state==="over"){
        frameResult.innerHTML = frames[i].type;
      }
    }

    container!.appendChild(table);

}

 function setDisplay(message: string){
    document.getElementById("Display")!.textContent = message;
}

function setInstructions(message: string){
    document.getElementById("Instrucitons")!.textContent = message;
}

function setScore(score: number){
    document.getElementById("Score")!.textContent = score.toString();
}

function setScoreHeader(message: string){
    document.getElementById("ScoreHeader")!.textContent = message;
}

//////

//test data
function runTestData(){
    game.frame = 10;
    theFrames[1].roll1 = 4;theFrames[1].roll2=3;
    theFrames[2].roll1 = 7;theFrames[2].roll2=3;
    theFrames[3].roll1 = 5;theFrames[3].roll2=2;
    theFrames[4].roll1 = 8;theFrames[4].roll2=1;
    theFrames[5].roll1 = 4;theFrames[5].roll2=6;
    theFrames[6].roll1 = 2;theFrames[6].roll2=4;
    theFrames[7].roll1 = 8;theFrames[7].roll2=0;
    theFrames[8].roll1 = 8;theFrames[8].roll2=0;
    theFrames[9].roll1 = 8;theFrames[9].roll2=2;
    theFrames[10].roll1 = 10;theFrames[10].roll2=1;theFrames[10].roll3=7;
    calculateScore();
    console.log("Test: Score Calculation 1")
    console.log(game.score);
    //

    game.frame = 10;
    theFrames[1].roll1 = 10;theFrames[1].roll2=0;
    theFrames[2].roll1 = 10;theFrames[2].roll2=0;
    theFrames[3].roll1 = 10;theFrames[3].roll2=0;
    theFrames[4].roll1 = 10;theFrames[4].roll2=0;
    theFrames[5].roll1 = 10;theFrames[5].roll2=0;
    theFrames[6].roll1 = 10;theFrames[6].roll2=0;
    theFrames[7].roll1 = 10;theFrames[7].roll2=0;
    theFrames[8].roll1 = 10;theFrames[8].roll2=0;
    theFrames[9].roll1 = 10;theFrames[9].roll2=0;
    theFrames[10].roll1 = 10;theFrames[10].roll2=10;theFrames[10].roll3=10;
    calculateScore();
    console.log("Test: Score Perfect Game")
    console.log(game.score);

    //    
    theFrames[10].roll1 = 10;
    theFrames[10].roll2 = 10;
    thePins.forEach(function(p){
        p.upRight = false;
    });
    game.frame = 10;
    game.roll = 2;   
    advanceFrameAndRoll();
    console.log("Test: Frame 10 - Just rolled double strike");
    console.log("Passed? "+ (game.frame === 10 && game.roll === 3 && thePins[0].upRight));

    //    
    theFrames[10].roll1 = 10;
    theFrames[10].roll2 = 9;
    thePins.forEach(function(p){
        p.upRight = false;
    });
    thePins[0].upRight = true;
    game.frame = 10;
    game.roll = 2;   
    advanceFrameAndRoll();
    console.log("Test: Frame 10 - Just rolled strike then nine");
    console.log("Passed? "+ (game.frame === 10 && game.roll === 3 && thePins[0].upRight && !thePins[1].upRight));    


}