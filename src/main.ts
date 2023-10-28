/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge, } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import {Viewport,Constants,Block,initialState} from "./constants"
import { addNewBlockString } from "./utils";
import {Tick,reduceState, Move, Restart, Rotate, Store} from "./state"



/** User input */
type Key = "KeyS" | "KeyA" | "KeyD"|"Space"|"KeyW"|"KeyC";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");


/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};


/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
const store = document.querySelector("#svgStore") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);
  store.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  store.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  const key$ =(e:Event)=> fromEvent<KeyboardEvent>(document, e);

  const fromKey = (e:Event,keyCode: Key) =>
    key$(e).pipe(filter(({ code }) => code === keyCode),filter(({repeat})=>(!repeat||!(keyCode==="KeyW"))));

  /** Observables */
  
  const left$ = fromKey("keydown","KeyA").pipe(map(_=>new Move({x:-1,y:0}))); // handle key a pressed, and move the shape horizontally to left
  const right$ = fromKey("keydown","KeyD").pipe(map(_=>new Move({x:1,y:0}))); // handle key d pressed, and move the shape horizontally to right
  const down$ = fromKey("keydown","KeyS").pipe(map(_=>new Move({x:0,y:1}))); // handle key s pressed, and move the shape down a position
  const space$ = fromKey("keydown","Space").pipe(map(_=>new Restart()));  // handle key space pressed, and restart the game if ended
  const rotate$ = fromKey("keydown","KeyW").pipe(map(_=>new Rotate())); // handle key w pressed, and rotate the shape clockwise
  const store$ = fromKey("keydown","KeyC").pipe(map(_=>new Store())); // handle key c pressed, and store the shape
  const tick$ = interval(Constants.TICK_RATE_MS).pipe(map(val=>new Tick(val)))

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    highScoreText.textContent = `${s.highScore}` // set the highscore text
    scoreText.textContent = `${s.score}` // set the score text
    levelText.textContent = `${s.level}` // set the level text


    s.currentShape.list.concat(s.blocks).map((val)=>{
    /**
     * draw the blocks on the svg canvas,
     * if the element already exists, change the attribute x and y,
     * if not, create a new element and append it to the svg canvas 
     */
      const item = document.getElementById(val.id);
      if(item){
        item.setAttribute('x',`${val.position.x*Block.WIDTH}`)
        item.setAttribute('y',`${val.position.y*Block.HEIGHT}`)
      }else{
        const block = createSvgElement(svg.namespaceURI, "rect", addNewBlockString(val))
        block.setAttribute("id",val.id)
        svg.appendChild(block);
      }
      
    })  

    /**
     * remove the expired preview
     */
    s.changedPreview.map((val)=>{
      const item = document.getElementById(val.id);
      if(item){
      preview.removeChild(item)}
    })
  
    /**
     * draw the preview blocks in the preview canvas, 
     * if it already exists, ignore it, 
     * else create new element, append it to preview canvas
     */
    s.preview.list.map((val)=>{
      const item = document.getElementById(val.id);
      if(!item){
      const block = createSvgElement(preview.namespaceURI, "rect", addNewBlockString(val))
        block.setAttribute("id",val.id)
        preview.appendChild(block);
    }
    })

    /**
     * Remove all the cleared blocks
     */
    s.removed.map((val)=>{
      const item = document.getElementById(val.id);
      if(item){
      svg.removeChild(item)
      }
    }
    );

    /**
     * Draw the shape stored in state
     */
    if(s.store){
      s.store.list.map((val)=>{
        const item = document.getElementById(val.id)
        if(!item){
          const block = createSvgElement(store.namespaceURI,"rect",addNewBlockString(val))
          block.setAttribute("id",val.id)
          store.appendChild(block)
        }
      })
    }

    /**
     * remove the chanegd stored shape
     */
    if(s.changedStore){
      s.changedStore.map((val)=>{
        const item = document.getElementById(val.id);
        if(item){
        store.removeChild(item)}
      })
    }

    /**
     * show the game over text if game has ended
     */
    if (s.gameEnd) {
      show(gameover);
    } else {
      hide(gameover);
    }

  }

  /**
   * merge all the observables, handle it and render it in subscribe, update the speed to suit the level
   */
  const source$ = merge(tick$,right$,left$,down$,space$,rotate$,store$)
    .pipe(
      scan(reduceState, initialState),
    )
    .subscribe((s: State) => {
      render(s);
    });
}




// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
