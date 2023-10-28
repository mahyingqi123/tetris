

type pos =Readonly<{
  /**
   * A representation of x,y coordinates in the grid
   */
    x:number,
    y:number
  }>

type SmallBlock = Readonly<{
  /**
   * A single 1 x 1 block 
   */
    id:string, // The id of this block
    height: number, // The height of this block
    width: number, // The width of this block
    position: pos, // The position of this block
    style: string, // the colour of this block
    
  }>
  
  type Shape = Readonly<{
    /**
     * A type for tetrominoes 
     */
    list: ReadonlyArray<SmallBlock>, // A list of blocks that forms the tetromino
    center:pos, // The center of the tetromino
    rotateState:number, // state of rotation of the shape
    landDelay:number, // To indicate how much longer to delay after landing
    rotateWay:ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>, // ways of rotating for the shape
    swapped:boolean // determine whether the shape is swapped in this turn
  }>
  type Matrix = ReadonlyArray<ReadonlyArray<boolean>>;
  
  type State = Readonly<{
    /**
     * A type for the game state
     */
    store:Shape|null; // the stored shape
    preview:Shape;// the next tetromino 
    blocksCount: number;// total number of blocks in the grid
    currentShape: Shape;// the current tetromino
    blocks: ReadonlyArray<SmallBlock>;// a list of blocks currently in the grid
    removed: ReadonlyArray<SmallBlock>;// blocks to be removed from the grid
    gameEnd: boolean;// indicator for whether the game has ended
    currentArray:Matrix;// the initial matrix representation of the game
    score:number; // current score of the game
    highScore:number;// highest score achieved
    changedPreview:ReadonlyArray<SmallBlock>;// expired preview to be removed
    level:number //current level of the game
    speed:number // rate of the game
    changedStore:ReadonlyArray<SmallBlock>|null // the stored shape to be removed
  }>;

  /**
   * The interface of all action implementation
   */
  interface Action{
    apply(state:State):State
  }