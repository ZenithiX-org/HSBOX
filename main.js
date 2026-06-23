import { createScene } from "./scene.js";

const canvas = document.getElementById("renderCanvas");
const uiLayer = document.getElementById("ui-layer");
const mainMenu = document.getElementById("main-menu-screen");

let engine = null;
let scene = null;

function startGame(mapType) {
    // Hide menu, show game
    mainMenu.style.display = "none";
    uiLayer.style.display = "block";
    canvas.style.display = "block";

    if (!engine) {
        engine = new BABYLON.Engine(canvas, true);
        
        window.addEventListener("resize", () => {
            if (engine) engine.resize();
        });
    }

    // Clean up previous scene if any
    if (scene) {
        scene.dispose();
    }

    scene = createScene(engine, canvas, mapType);

    engine.stopRenderLoop();
    engine.runRenderLoop(() => {
        if (scene) scene.render();
    });
}

function returnToHome() {
    if (engine) {
        engine.stopRenderLoop();
    }
    if (scene) {
        scene.dispose();
        scene = null;
    }

    // Hide game, show menu
    mainMenu.style.display = "flex";
    uiLayer.style.display = "none";
    canvas.style.display = "none";
    
    document.exitPointerLock();
    // Force show cursor in case browser is sticky
    document.body.style.cursor = "default";
}

// Bind Map Select Buttons
document.querySelectorAll(".map-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const mapType = btn.getAttribute("data-map");
        startGame(mapType);
    });
});