import {newShape} from "./utils.ts"
import {Constants,array} from "./constants"
export {Move,Restart,Rotate,Tick,Store,reduceState}

/**
 * Class that stores function related to shape movin
 */
class Move implements Action {

  /**
   * Store the attribute for shape moving
   * @param direction x,y indicating how to move the shape
   */
  constructor (public readonly direction:pos){}

  /**
   * Move the block according to the position 
   * @param state the current game state
   * @returns the new game state with shape moved
   */
  apply = (state:State) => {

    const movedBlocks = state.currentShape.list.map(
      (val:SmallBlock):SmallBlock=>{
        return({
      ...val,
      position:{x:val.position.x+this.direction.x, y:val.position.y+this.direction.y},

    })})

    const validMove = validBlocksPosition(movedBlocks)(state.currentArray);// check if the moving direction is blocked

    return {
      ...state,
      currentShape:{
        ...state.currentShape,
        center:validMove?{
          x:state.currentShape.center.x+this.direction.x,
          y:state.currentShape.center.y+this.direction.y
        }:state.currentShape.center,
        list: validMove?movedBlocks:state.currentShape.list,
        landDelay:Tick.checkLanded(state)? // Decrease landing delay by 1 if shape has landed
        (this.direction.y>0?
          state.currentShape.landDelay-1
          :state.currentShape.landDelay)
          :state.currentShape.landDelay
      }
    }
  }
}

/**
 * A class that stores the function related to shape rotation
 */
class Rotate implements Action {
  /**
   * Function to rotate the shape
   * @param rotateState the rotate state to rotate to
   * @param shape the shape to be rotated
   * @param rotateWay the list of way where the shape can be rotated
   * @returns a list of blocks for the rotated shape
   */

  rotateShape = (rotateState:number)=> 
  (shape:Shape)=>
  (rotateWay:ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>):ReadonlyArray<SmallBlock>=>
  {
    return shape.list.map((val,index)=>{
      return {
      ...val,
      position:{
        x:shape.center.x + rotateWay[rotateState][index][0],
        y:shape.center.y +rotateWay[rotateState][index][1]
      }
    }})
  }

  /**
   * A function to rotate the current shape
   * @param state the current game state
   * @returns the state after rotating the current shape
   */

  apply(state:State):State{

    // Create the list of blocks after shape is rotated
    const rotated = this.rotateShape((state.currentShape.rotateState+1)%4)(state.currentShape)(state.currentShape.rotateWay)

    // Check if rotation is valid
    if(validBlocksPosition(rotated)(state.currentArray)){
      return {
        ...state,
        currentShape: {
          ...state.currentShape,
          list:rotated,
        rotateState:(state.currentShape.rotateState+1)%4},
      }
    }else{
      //try to perform wall kick
      // move all blocks to the right
      const kickedRight = rotated.map((val)=>({
        ...val,
        position:{
          ...val.position,
          x:val.position.x+1
        }
      }))
      //move all blocks to the left
      const kickedLeft = rotated.map((val)=>({
        ...val,
        position:{
          ...val.position,
          x:val.position.x-1
        }
      }))
    // kick to the right
      if(validBlocksPosition(kickedRight)(state.currentArray)){
        return {
          ...state,
          currentShape: {
            ...state.currentShape,
            list:kickedRight,
          rotateState:(state.currentShape.rotateState+1)%4},
        }
        // kick to the left
      }else if(validBlocksPosition(kickedLeft)(state.currentArray)){
        return {
          ...state,
          currentShape: {
            ...state.currentShape,
            list:kickedLeft,
          rotateState:(state.currentShape.rotateState+1)%4},
        }
      }
    // fail if kicks are not valid
      return state
    }
  }
}

/**
 * Check if the blocks are at a valid position
 * @param blocks blocks to be checked
 * @param matrix the matrix indicating positions occupied
 * @returns boolean indicating the blocks position are valid or not
 */
const validBlocksPosition = (blocks:ReadonlyArray<SmallBlock>) => (matrix:Matrix):boolean => {
  return  blocks.reduce((acc,val)=>
  acc
  &&val.position.x>=0
  &&val.position.y<Constants.GRID_HEIGHT
  &&val.position.x<Constants.GRID_WIDTH
  &&(matrix[val.position.y+2][val.position.x]),true)
}



/**
 * Class that keeps all the functions related to game tick
 */
class Tick implements Action {
  constructor (public readonly elapsed:number){}

  /**
   * check if the row is full
   * @param row a single row in the grid matrix
   * @returns boolean indivating whether row is cleared
   */
  checkClear=(row:ReadonlyArray<boolean>):boolean =>{
    return row.reduce((arr,val)=>arr||val,false)
  }

  /**
   * Create a new matrix according to the list of blocks
   * @param blocks list of blocks in the game
   * @returns 
   */
  updateMatrix = (blocks:ReadonlyArray<SmallBlock>):Matrix=>{
    return blocks
      .reduce((acc,val)=>{
          return acc.map((row,y)=>{
            return row.map((occupied,x)=>{
              return (occupied)&&(!(x==val.position.x&&y==val.position.y+2))// mark all the position with blocks true
            })
          })},
        array.map((val)=>val.slice()))// make a copy of the original matrix

    }

/**
   * Removed the row of blocks in the grid if it is full
   * @param state the current state of the game
   * @returns the updated state with full rows cleared
   */
clearRow = (state:State):State => {

  /**
   * Construct an array that contains the row number that are full
   */
  const emptyArr = state.currentArray.reduce((acc:Array<number>,val:ReadonlyArray<boolean>,index)=>{
  if(!this.checkClear(val)){
    return acc.concat(index-2) // concat row index if its full
  }
  return acc
},
[]
  )

  return {
      ...state,
      //filter out the blocks that are positioned at the full rows
      blocks:state.blocks.filter(
          val=>!emptyArr.includes(val.position.y))
          .map(
              (block)=>
              {
                  const drop = emptyArr.filter((val)=>val>block.position.y).length
                  return{
                      ...block,
                      position: {x:block.position.x,y:block.position.y+drop}
                  }
              }),
      level:Math.floor((state.score+emptyArr.length)/5), // update the score
      // remove the rows of blocks that are located on full rows
      removed:state.blocks.filter(val=>emptyArr.includes(val.position.y)),
      // update the matrix with rows removed
      currentArray:this.updateMatrix(state.blocks.filter(val=>!emptyArr.includes(val.position.y))),
      // update the score according to rows cleared
      score:state.score+emptyArr.length,
      highScore:((state.score+emptyArr.length)>state.highScore)?state.score+emptyArr.length:state.highScore,
      speed:(20*Math.floor((state.score+emptyArr.length)/5)<150)?150-20*Math.floor((state.score+emptyArr.length)/5):state.speed

  }
}

/**
* check if the current shape has landed
* @param state the current game state
* @returns boolean indicating if the shape has landed
*/
static checkLanded = (state:State):boolean =>{
  console.log(state.currentArray)
  return state.currentShape.list.map(
    (val:SmallBlock)=>{
  return (val.position.y+1>=Constants.GRID_HEIGHT||!state.currentArray[val.position.y+3][val.position.x]) 
  // check one position down the block
}
  )
  .reduce((acc,val)=>{return acc||val},false)
}

/**
   * Move the current shape downward
   * @param state the current state of game
   * @returns return a new state with the current shape moved down a block
   */
descend = (state:State):State =>{
    
  if(!Tick.checkLanded(state)){
    return {
      ...state,
      currentShape:{
      ...state.currentShape,
      center:{
        ...state.currentShape.center,
        y:state.currentShape.center.y+1},// move the center
      list: state.currentShape.list.map(
        val=>{
          return({
        ...val,
        position:  {y:1 +val.position.y, x:val.position.x},// move the blocks
      })}),
    }
  }
    }
  else{
    return state
  }}

  /**
 * handle the game ending 
 * @param state the current game state
 * @returns the game state with ending condition handled
 */
gameEnd = (state: State):State=>{
  // check the the row that's out of the canvas, if there's a block, then game end
  const notEnded = state.currentArray[1].reduce((acc,val)=>{return acc&&val},true)

    return {
        ...state,
        gameEnd: !notEnded,
        // remove all the blocks if game ended
        removed: !notEnded?state.removed.concat(state.blocks).concat(state.currentShape.list):state.removed,

    }
}
  /**
   * convert preview to current
   * @param preview the preview shape
   * @returns a shape converted to current shape
   */
  
  previewToCurrent = (preview:Shape):Shape=>{
    return {
      ...preview,
      center:{x:4,y:-1},// set the center of the shape to the grid

      list: preview.list.map((val,index)=>{
        return {
        ...val,
        id:`swapped${val.id}`,
        position:{ // change the position into the canvas
          x:4 + preview.rotateWay[0][index][0],
          y:-1+preview.rotateWay[0][index][1]
        }
      }})
    }
  }

/**
 * Handle the the landing of the shape.
 * @param state the current game state
 * @returns the state after handling landing connection
 */
landed = (state:State):State =>{

  // Check if the shape has landed and the game has not ended
  if(Tick.checkLanded(state)&&!state.gameEnd){
    // Check if the shape has delayed enough
    if(state.currentShape.landDelay>0){
      return {
        ...state,
        currentShape:{
          ...state.currentShape,
          landDelay:state.currentShape.landDelay-1// reduce the delay time
        }
      }
    }else{
      // Update the state to replace the shape and preview
      return {
          ...state,
          blocksCount:state.blocksCount+4,
          currentShape:this.previewToCurrent(state.preview), // change the preview shape to current shape
          currentArray:this.updateMatrix(state.blocks.concat(state.currentShape.list)), // update the grid matrix
          blocks:state.blocks.concat(state.currentShape.list), // put the landed shape into stationary block list
          preview:newShape({x:3,y:2},state.blocksCount),// create a new preview
          changedPreview:state.preview.list, // remove the preview shape

      }
  }
  // return the input state if the game has ended or the shape has not landed
  }else{
        return state
    }
  } 

  /**
   * Handles all the tick based activities of the game
   * @param state the current state of the game
   * @returns the game state after handling shape dropping, game ending, row clearing and landing condition
   */
  apply(state:State):State{
    if(this.elapsed%state.speed === 0){ // when the it's time to handle the tick
    return this.landed(this.descend(state)) // drop the block and check if it has landed
    }else{
      return this.gameEnd(this.clearRow(state)) // clear row and check if game has ended
    }
  }
}


/**
 * Class that handles the restart of the game
 */
class Restart implements Action{

  /**
 * Restart the game
 * @param state the current game state
 * @returns a restarted game state
 */
  apply(state:State):State{
    if(state.gameEnd){
      return {
        blocksCount: state.blocksCount+8,
        preview:newShape({x:3,y:2},state.blocksCount+4),
        currentShape: newShape({x:4,y:-1},state.blocksCount),
        blocks: [],
        removed: [],
        gameEnd: false,
        currentArray:array,
        score:0,
        highScore: state.highScore, 
        changedPreview:state.preview.list,
        level:0,
        speed:150,
        store:null,
        changedStore:state.store?state.changedPreview.concat(state.store.list):state.changedPreview
      }}else{
        return state
      }
  }
}

/**
 * A class that handles the storing of shape
 */
class Store implements Action{

  /**
   * Convert the shape to another position in another canvas
   * @param shape the shape to be converted
   * @param center the center position of the shape
   * @returns the block list of the shape that is converted
   */
  convert = (shape:Shape)=>(center:pos):ReadonlyArray<SmallBlock>=>{
    return shape.list.map((val,index)=>{
    return {
    ...val,
    id:`swapped${val.id}`,
    position:{
      x:center.x + shape.rotateWay[0][index][0],
      y:center.y +shape.rotateWay[0][index][1]
    }
  }})}

  /**
   * Swap the shape 
   * @param center the center position of the shape
   * @param shape the shape to be swapped
   * @param swapped determine if the shape should be swapped again
   * @returns the swapped shape
   */
  swap =(center:pos) => (shape:Shape) =>(swapped:boolean):Shape=> {
    return {
      ...shape,
      swapped:swapped,
      center:center,// set the center of the shape to the grid
      list: this.convert(shape)(center)
  }
  }

  /**
   * Handle the swapping of shape
   * @param state The current game state
   * @returns the game state with teh shape swapped
   */
  apply = (state:State):State => {
    if(state.store&&!state.currentShape.swapped){ // if the shape is allowed to swap
      return {
        ...state,
        store: this.swap({x:3,y:2})(state.currentShape)(false), // swap the current shape to store
        currentShape:this.swap({x:4,y:-1})(state.store)(true), // swap the store to current shape
        removed:state.removed.concat(state.currentShape.list), // remove the current shape from canvas
        changedStore: state.store.list // remove the current store form canvas
      }
    }else if (state.store&&state.currentShape.swapped){ // if the shape is not allowed to swap
      return state
    }
    else{
      // if this is the first swap
    return {
      ...state,
      store: this.swap({x:3,y:2})(state.currentShape)(false), //swap the current shape to store
      currentShape:this.swap({x:4,y:-1})(state.preview)(true), // swap the preview to current shape
      preview:newShape({x:3,y:2},state.blocksCount), //create a new preview
      changedPreview:state.preview.list, // remove the old preview
      removed:state.removed.concat(state.currentShape.list), // rmemove the current shape
      blocksCount:state.blocksCount+4
    }
  }
  } 
}

/**
 * A function to reduce the state with the input function
 * @param state the current game state
 * @param action the action to be done on the game state
 * @returns the reduced game state
 */
const reduceState = (state:State,action:Action)=> {
    return action.apply(state)}