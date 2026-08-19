import { setupPlayer } from "./player.js";
import { setupPhysics, createCube, createSphere, createCylinder } from "./physics.js";
import { setupWeapons, setWeaponMode } from "./weapon.js";
import { buildWorld, buildFootballField, buildOpenField } from "./world.js";

export function createScene(engine, canvas, mapType) {
    const scene = new BABYLON.Scene(engine);
    setupPhysics(scene);

    const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, scene.cameras);
    pipeline.samples = 4; // MSAA (Anti-aliasing)
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.6;
    pipeline.bloomWeight = 0.5;
    pipeline.bloomKernel = 64;
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingOperator.TONEMAPPING_ACES;
    scene.postProcessManager.addPipeline(pipeline);

    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.08, 1); // Darker, cinematic background
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0015;
    scene.fogColor = new BABYLON.Color3(0.05, 0.05, 0.08);

    const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    const camera = setupPlayer(scene, canvas);

    const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(50, 100, 50);
    light.intensity = 1.2; // Brighter for PBR
    light.shadowEnabled = true;

    // Shadows
    const shadowGen = new BABYLON.ShadowGenerator(2048, light);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 32;
    shadowGen.darkness = 0.4;

    // Build Map
    if (mapType === "arena") buildWorld(scene, shadowGen);
    else if (mapType === "football") buildFootballField(scene, shadowGen);
    else if (mapType === "open") buildOpenField(scene, shadowGen);
    else buildWorld(scene, shadowGen);

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.2); // Dark blue/grey sky
    skybox.material = skyMat;
    skybox.infiniteDistance = true;

    function spawnProp(type) {
        let prop;
        if (type === "cube") prop = createCube(scene, camera);
        if (type === "sphere") prop = createSphere(scene, camera);
        if (type === "cylinder") prop = createCylinder(scene, camera);
        if (prop) shadowGen.addShadowCaster(prop);
    }

    // --- Menu Logic ---
    const spawnMenu = document.getElementById("spawn-menu");
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "q") {
            if (spawnMenu.classList.contains("hidden-menu")) {
                spawnMenu.classList.remove("hidden-menu");
                document.exitPointerLock();
            } else {
                spawnMenu.classList.add("hidden-menu");
                canvas.requestPointerLock();
            }
        }
    });

    document.querySelectorAll(".spawn-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            spawnProp(btn.getAttribute("data-type"));
            spawnMenu.classList.add("hidden-menu");
            canvas.requestPointerLock();
        });
    });

    document.querySelectorAll(".tool-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            setWeaponMode(btn.getAttribute("data-tool"), btn.getAttribute("data-color"));
            spawnMenu.classList.add("hidden-menu");
            canvas.requestPointerLock();
        });
    });

    setupWeapons(scene, camera);
    return scene;
}
