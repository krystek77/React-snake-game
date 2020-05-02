import React, { Component } from 'react';
import './App.css';
import bg_music from './assets/battle.wav';

class App extends Component {
  constructor(){
    super();

    this.CELL_W = 30;
    this.CELL_H = 30;
    this.SIZE = 20;
    this.BOARD_W =this.CELL_W*this.SIZE;
    this.BOARD_H =this.CELL_H*this.SIZE;
    this.moveTime = 0;

    this.lastTime = 0;
    //
    this.bg_m = new Audio(bg_music); 
    if (typeof this.bg_m.loop == 'boolean')
    {
      this.bg_m.loop = true;
    }
    else
    {
      this.bg_m.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
      }, false);
    }
    this.bg_m.play();
    //
    this.state={
      moveInterval:1000,
      board : [],
      apple : {
        row: 0,
        col: 0
      },
      snake:{
        head:{
          row:Math.floor(this.SIZE/2)-1,
          col:Math.floor(this.SIZE/2)-1
        },
        tail:[],
        velocity:{
          row:1,
          col:0,
        }
      },
      score:0,
      gameOver:false
    }

    this.createBoard = ()=>{
      const board = Array.from({length:this.SIZE},(row,y)=>Array.from({length:this.SIZE},(col,x)=>{
        return {row:y,col:x}
      }))

      return board;
    }
    this.randomApple = () => {
      const {snake:{head}} = this.state;
      const newApple = {
        row:Math.floor(Math.random()*(this.SIZE-2))+1,//1-18
        col:Math.floor(Math.random()*(this.SIZE-2))+1,//1-18
      }
      if((newApple.row === head.row && newApple.col === head.col) 
        || this.isTail(newApple)) {
          return this.randomApple();
        }
        else {
          return newApple;
        }
    }
    this.randomCell = ()=>{
      return {
        row:Math.floor(Math.random()*(this.SIZE-2))+1,//1-18
        col:Math.floor(Math.random()*(this.SIZE-2))+1,//1-18
      }
    }
    this.state.board = this.createBoard();
    this.state.apple = this.randomApple();
    this.state.snake.head = this.randomCell();
    document.body.addEventListener('keypress',(event)=>this.setDirection(event));
    this.gameLoop();
  }
  //
  setDirection = (event) => {
    if(event.keyCode===65){
      // console.log("LEFT");
      const {snake:{velocity}} = this.state;
      if(velocity.col===1) return
      let v = {...velocity};
      v.row = 0;
      v.col = -1;
      this.setState(({snake})=>{
        return {
          snake:{
            ...snake,
            velocity:v
          }
        };
      });
    }else if(event.keyCode===85){
      
      // console.log("UP");
      const {snake:{velocity}} = this.state;
      if(velocity.row===1) return;
      let v = {...velocity};
      v.row = -1;
      v.col = 0;
      this.setState(({snake})=>{
        return {
          snake:{
            ...snake,
            velocity:v
          }
        };
      });
    }else if(event.keyCode===68){
      // console.log("RIGHT");
      const {snake:{velocity}} = this.state;
      if(velocity.col===-1) return;
      let v = {...velocity};
      v.row = 0;
      v.col = 1;
      this.setState(({snake})=>{
        return {
          snake:{
            ...snake,
            velocity:v,
          }
        };
      });
    }else if(event.keyCode===83){
      // console.log("DOWN")
      const {snake:{velocity}} = this.state;
      if(velocity.row===-1) return;
      let v = {...velocity};
      v.row = 1;
      v.col = 0;
      this.setState(({snake})=>{
        return {
          snake:{
            ...snake,
            velocity:v
          }
        };
      });
    }
  }
  //
  gameLoop(time=0){
    const {gameOver,moveInterval} = this.state;
    if(gameOver) return;

    let deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.moveTime+=deltaTime;

    if(this.moveTime >= moveInterval){
      //
      this.move();
      //
    }
    requestAnimationFrame((time)=>this.gameLoop(time))
  }

  move = () =>{
    this.moveTime = 0;
    this.setState(({snake,snake:{head,tail},apple,moveInterval})=>{
      // console.log("UPDATER")
      const collideWithApple = this.isCollideApple();
     
      const nextState = {
        snake:{
          ...snake,
          head:{
            row:head.row+snake.velocity.row,
            col:head.col+snake.velocity.col
          },
          tail:[head,...tail]
        },
        apple:collideWithApple ? this.randomApple() : apple,
        score:tail.length,
        moveInterval:tail.length ? Math.min(Math.floor(1000/tail.length) + 200,800): 1000
      }
      if(!collideWithApple) {nextState.snake.tail.pop()}
      return nextState;
    }
    ,()=>{
      // console.log("CALLBACK FROM setStat()")
      if(this.isCollideEdge() || this.isTail(this.state.snake.head)){
        this.bg_m.pause();
        this.setState({
          gameOver:true,
        })
      } 
      return;
    });
    //
  }

  //
  isCollideEdge = ()=> {
    const {snake:{head}} = this.state;
    if(head.row < 0
      || head.row > this.SIZE -1
      || head.col < 0
      || head.col > this.SIZE -1
      ){
        return true;
      }
    return false;
  }
  //
  isCollideApple = () => {
    const {snake:{head},apple} = this.state;
    return apple.row===head.row && apple.col === head.col;
  }
  //
  isApple = (cell) =>{
    const {apple} = this.state;
    return cell.row === apple.row && cell.col === apple.col;
  }
  //
  isHead = (cell) => {
    const {snake:{head}} = this.state;
    return cell.row===head.row && cell.col === head.col;
  }
  //
  isTail = (cell) => {
    const {snake:{tail}} = this.state;
    if(tail.find((t)=>{
        return t.row===cell.row && t.col === cell.col;
    })!==undefined){
      return true;
    };
    return false;
  }
  //
  handleStart=()=>{
    console.log("START NEW GAME");
    this.resetGame();
  }
  resetGame = () => {
    // console.log("RESET GAME");

    let {board,apple,snake:{head}} = this.state;
    board = this.createBoard();
    apple = this.randomApple();
    head = this.randomCell();
    this.bg_m.play();
    this.setState(()=>{
      return {
        board,
        apple,
        snake:{
          head,
          tail:[],
          velocity:{
            row:1,
            col:0,
          }
        },
        score:0,
        gameOver:false,
        moveInterval:1000
      }
    },()=>this.gameLoop());

  }
  //
  render(){
    // console.log("RENDER")
    const {board,gameOver,snake:{head},score} = this.state;

    let boardContext = (
      board.map((row,y)=>{
        return row.map((cell,x)=>{
          return (
            <div key={`[${x};${y}]`}
            className={this.isHead(cell) ? "cell snake-head" : this.isApple(cell) ? "cell apple": this.isTail(cell) ? "cell snake-tail" : "cell"}>
            [{x};{y}]
            </div>)
        });
      })
    )
    if(gameOver){
      boardContext = (
        <div className="result-board">
          <p className="game-over">GAME OVER</p>
          <span className="game-pad" role="img" aria-label="game-pad">🎮</span>
          <button className="try-again" onClick={()=>{this.handleStart()}}>Try again</button>
        </div>
      )
    }

    return (
      <div className="App">

        <div className="dashboard">
          <h2>Controls</h2>
          <span className="snake-logo" role="img" aria-label="snake-image">🐍</span>
          <p className="score">Score: <strong>{score}</strong></p>
          <button className="reset-game" onClick={()=>this.resetGame()}>Reset</button>
        </div>

        <div className="game-board">
          <h1>React Snake Game <span className="snake-icon" role="img" aria-label="snake-icon">🐍</span></h1>
          <div className="board">
            {
              boardContext
            }
          </div>
          <div className="tips">
            {this.isCollideEdge() ? 
              <p>You've really broken your head against the wall!
              <span role="img" aria-label="tip-icon-bell"> 🔔 </span>
              Who does this like you?
              <span role="img" aria-label="tip-icon-dizzy"> 😵 </span>
              </p>
              : this.isTail(head) ?
              <p>Bon appetit!
              <span role="img" aria-label="tip-icon-yourself"> 😇 </span>
              Who does eat yourself!!!. You are a cannibal, brrr
              </p>
              :
              this.isCollideApple() ? 
              <p>Bon appetit!
              <span role="img" aria-label="tip-icon-eat"> 👌 </span>
              You become fatter, but you are young, so it is no problem, but later...
              </p>
              :
              <p>Eat the apples
              <span role="img" aria-label="tip-icon-apple"> 🍎 </span>
              , avoid own tail and edges
              <span role="img" aria-label="tip-icon-wall"> ⚠️ </span>
              </p>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default App;
