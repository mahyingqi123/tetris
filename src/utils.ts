import { Block } from "./constants";
export {newShape,addNewBlockString}
/**
 * Create a new block with the parameters
 * @param position position where the block should locate
 * @param colour colour the block should have
 * @param objId the id of the block
 * @returns the block positioned at the position, with the colour and have the id as object id
 */
const addNewBlock = (position:pos,colour:string,objId:string):SmallBlock =>({
    id:objId,
    height: Block.HEIGHT,
    width: Block.WIDTH,
    position: position,
    style: colour,

  })
  
  /**
   * Convert the block's attribute to a string that can be attached to html
   * @param param0 the block to be visualized
   * @returns a structure that contains attributes to be visualized
   */
  const addNewBlockString = ({position,style}:SmallBlock) =>({
  
    height: `${Block.HEIGHT}`,
    width: `${Block.WIDTH}`,
    x: `${position.x*Block.WIDTH}`,
    y: `${position.y*Block.HEIGHT}`,
    style: `fill: ${style}`,
  })

  
  /**
   * A hash function that hashed the seed to number between 0 to a desired number
   * @param seed the seed to be hashed
   * @param max the maximum number to be generated
   * @returns the hashed seed under max
   */
  const hash = (seed: number,max:number):number =>{
  const m = 0x80000000; // 2**31
  const a = 1103515245;
  const c = 12345;
  return ((a * seed + c) % m)%max;
  }

  /**
   * Randomly create a new shape based on object Id
   * @param param0 position to place the new shape
   * @param objId first id of the new shape
   * @returns a randomly created new shape 
   */
  const newShape= ({x,y}:pos,objId:number):Shape=>{
    const shapes = [createJ,createL,createS,createStraight,createT,createZ,createSquare]
    return shapes[hash(objId,shapes.length)]({x:x,y:y},objId)
  }
  
  /**
   * Create a square shape
   * @param param0 the position to place the square
   * @param objId the first id of the shape
   * @returns a square shape at input position with id as object id
   */
  const createSquare = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,-1],
        [1,-1],
        [0,0],
        [1,0]
      ],
      [
        [0,-1],
        [1,-1],
        [0,0],
        [1,0]
      ],
      [
        [0,-1],
        [1,-1],
        [0,0],
        [1,0]
      ],
      [
        [0,-1],
        [1,-1],
        [0,0],
        [1,0]
      ]],
    center:{x:x,y:y},
    list: [
      addNewBlock({x:x,y:y},"yellow",`square${objId}`),
      addNewBlock({x:x+1,y:y},"yellow",`square${objId+1}`),
      addNewBlock({x:x,y:y-1},"yellow",`square${objId+2}`),
      addNewBlock({x:x+1,y:y-1},"yellow",`square${objId+3}`)
    ]
    ,landDelay:2
  })

    /**
   * Create a T shape
   * @param param0 the position to place the T shape
   * @param objId the first id of the shape
   * @returns a T shape at input position with id as object id
   */
  const createT = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,-1],
        [-1,0],
        [0,0],
        [1,0]
      ],
      [
        [0,-1],
        [0,1],
        [0,0],
        [1,0]
      ],
      [
        [-1,0],
        [0,1],
        [0,0],
        [1,0]
      ],
      [
        [-1,0],
        [0,1],
        [0,0],
        [0,-1]
      ]],

    center:{x:x,y:y},
    list: [
      addNewBlock({x:x-1,y:y},"purple",`T${objId}`),
      addNewBlock({x:x+1,y:y},"purple",`T${objId+1}`),
      addNewBlock({x:x,y:y},"purple",`T${objId+2}`),
      addNewBlock({x:x,y:y-1},"purple",`T${objId+3}`)
    ],landDelay:2
  })

    /**
   * Create a straight shape
   * @param param0 the position to place the straight
   * @param objId the first id of the straight
   * @returns a straight shape at input position with id as object id
   */
  const createStraight = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,0],
        [1,0],
        [2,0],
        [-1,0]
      ],
      [
        [1,0],
        [1,-1],
        [1,1],
        [1,2]
      ],
      [
        [0,1],
        [1,1],
        [2,1],
        [-1,1]
      ],
      [
        [0,-1],
        [0,1],
        [0,2],
        [0,0]
      ]],
    center:{x:x,y:y},
    list: [
      addNewBlock({x:x,y:y},"lightblue",`straight${objId}`),
      addNewBlock({x:x-1,y:y},"lightblue",`straight${objId+1}`),
      addNewBlock({x:x+1,y:y},"lightblue",`straight${objId+2}`),
      addNewBlock({x:x+2,y:y},"lightblue",`straight${objId+3}`)
    ],landDelay:2
  })

    /**
   * Create an S shape
   * @param param0 the position to place the S
   * @param objId the first id of the S
   * @returns an S shape at input position with id as object id
   */
  const createS = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,0],
        [1,-1],
        [0,-1],
        [-1,0]
      ],
      [
        [1,0],
        [1,1],
        [0,-1],
        [0,0]
      ],
      [
        [0,0],
        [1,0],
        [0,1],
        [-1,1]
      ],
      [
        [0,0],
        [0,1],
        [-1,0],
        [-1,-1]
      ]],
    center:{x:x,y:y-1},
    list: [
      addNewBlock({x:x-1,y:y},"green",`S${objId}`),
      addNewBlock({x:x+1,y:y-1},"green",`S${objId+1}`),
      addNewBlock({x:x,y:y},"green",`S${objId+2}`),
      addNewBlock({x:x,y:y-1},"green",`S${objId+3}`)
    ],landDelay:2
  })

    /**
   * Create a Z shape
   * @param param0 the position to place the Z
   * @param objId the first id of the Z
   * @returns a Z shape at input position with id as object id
   */
  const createZ = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,0],
        [0,-1],
        [-1,-1],
        [1,0]
      ],
      [
        [0,0],
        [0,1],
        [1,0],
        [1,-1]
      ],
      [
        [0,0],
        [-1,0],
        [0,1],
        [1,1]
      ],
      [
        [0,0],
        [0,-1],
        [-1,0],
        [-1,1]
      ]],
    center:{x:x,y:y-1},
    list: [
      addNewBlock({x:x+1,y:y},"red",`Z${objId}`),
      addNewBlock({x:x-1,y:y-1},"red",`Z${objId+1}`),
      addNewBlock({x:x,y:y-1},"red",`Z${objId+2}`),
      addNewBlock({x:x,y:y},"red",`Z${objId+3}`)
    ],landDelay:2
  })

    /**
   * Create a J shape
   * @param param0 the position to place the J
   * @param objId the first id of the shape
   * @returns a J shape at input position with id as object id
   */
  const createJ = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,0],
        [-1,0],
        [1,-1],
        [1,0]
      ],
      [
        [0,-1],
        [0,1],
        [0,0],
        [1,1]
      ],
      [
        [0,0],
        [-1,0],
        [1,0],
        [-1,1]
      ],
      [
        [0,0],
        [0,-1],
        [0,1],
        [-1,-1]
      ]],
    center:{x:x,y:y},
    list: [
      addNewBlock({x:x+1,y:y},"orange",`J${objId}`),
      addNewBlock({x:x+1,y:y-1},"orange",`J${objId+1}`),
      addNewBlock({x:x-1,y:y},"orange",`J${objId+2}`),
      addNewBlock({x:x,y:y},"orange",`J${objId+3}`)
    ],landDelay:2
  })

    /**
   * Create an L shape
   * @param param0 the position to place the L
   * @param objId the first id of the shape
   * @returns an L shape at input position with id as object id
   */
  const createL = ({x,y}:pos,objId:number=0):Shape =>({
    swapped:false,
    rotateState:0,
    rotateWay: [
      [
        [0,0],
        [-1,-1],
        [1,0],
        [-1,0]
      ],
      [
        [0,-1],
        [0,1],
        [0,0],
        [1,-1]
      ],
      [
        [0,0],
        [-1,0],
        [1,0],
        [1,1]
      ],
      [
        [0,0],
        [0,-1],
        [0,1],
        [-1,1]
      ]],
    center:{x:x,y:y},
    list: [
      addNewBlock({x:x+1,y:y},"blue",`L${objId}`),
      addNewBlock({x:x-1,y:y-1},"blue",`L${objId+1}`),
      addNewBlock({x:x-1,y:y},"blue",`L${objId+2}`),
      addNewBlock({x:x,y:y},"blue",`L${objId+3}`)
    ],landDelay:2
  })