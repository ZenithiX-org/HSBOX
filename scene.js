import { setupPlayer } from "./player.js";
import { setupPhysics, createCube, createSphere, createCylinder } from "./physics.js";
import { setupWeapons, setWeaponMode } from "./weapon.js";
import { buildWorld, buildFootballField, buildOpenField, loadCustomMap } from "./world.js";

export function createScene(engine, canvas, mapType) {
    const scene = new BABYLON.Scene(engine);

    // ⚙️ Physics (Reverted to Sync Cannon)
    setupPhysics(scene);

    // --- Polish: Rendering & Atmosphere ---
    const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.5;

    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.002;
    scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    const camera = setupPlayer(scene, canvas);

    const light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(50, 100, 50);
    light.intensity = 0.7;

    // Optimized: Lower shadow resolution and blur for better FPS
    const shadowGen = new BABYLON.ShadowGenerator(1024, light);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 16;
    shadowGen.transparencyShadow = false;

    if (mapType === "arena") buildWorld(scene, shadowGen);
    else if (mapType === "football") buildFootballField(scene, shadowGen);
    else if (mapType === "open") buildOpenField(scene, shadowGen);
    else buildWorld(scene, shadowGen);

    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1);
    skybox.material = skyMat;
    skybox.infiniteDistance = true;

    function spawnProp(type) {
        let prop;
        if (type === "cube") prop = createCube(scene, camera);
        if (type === "sphere") prop = createSphere(scene, camera);
        if (type === "cylinder") prop = createCylinder(scene, camera);
        if (prop) shadowGen.addShadowCaster(prop);
    }

    function shootForce() {
        const ray = camera.getForwardRay();
        const hit = scene.pickWithRay(ray);
        if (hit.pickedMesh?.physicsImpostor) {
            const force = ray.direction.scale(60);
            hit.pickedMesh.physicsImpostor.applyImpulse(force, hit.pickedPoint);
            if (hit.pickedMesh.material) {
                const oldEmissive = hit.pickedMesh.material.emissiveColor ? hit.pickedMesh.material.emissiveColor.clone() : BABYLON.Color3.Black();
                hit.pickedMesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
                setTimeout(() => { if (hit.pickedMesh?.material) hit.pickedMesh.material.emissiveColor = oldEmissive; }, 100);
            }
        }
    }

    const spawnMenu = document.getElementById("spawn-menu");
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "e") spawnProp("cube");
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

    window.addEventListener("mousedown", (e) => { if (e.button === 1) shootForce(); });

    setupWeapons(scene, camera);

    return scene;
}