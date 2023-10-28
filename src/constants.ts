export {Viewport,Constants,Block,initialState,array}
import { newShape } from "./utils";

const Viewport = {
  /**
   * A constant that defines the viewport size of the game, including canvas and preview
   */
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const;
  
  const Constants = {
    /**
     * A constant that defines the default tick rate, and the size of grid
     */
    TICK_RATE_MS: 0,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,

  } as const;
  
  const Block = {
    /**
     * A constant that defines the size of a singl block
     */
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  };

  // A 2d matrix representation of the grid of the tetris game, true meaning there's no block at that position, otherwise false
  const array:Matrix = Array(Constants.GRID_HEIGHT+2).fill(true).map(_=>Array(Constants.GRID_WIDTH).fill(true))

  const initialState: State = {
    /**
     * The initial state of the game
     */
    preview: newShape({x:3,y:2},0),
    blocksCount:8, 
    currentShape: newShape({x:4,y:-1},4), 
    blocks: [], 
    removed: [], 
    currentArray: array,
    gameEnd: false,
    score:0, 
    highScore:0,
    changedPreview:[],
    level:0,
    speed:150,
    store:null,
    changedStore:null 
  } as const;
