export function setupPlayer(scene, canvas) {
    const camera = new BABYLON.UniversalCamera("player", new BABYLON.Vector3(0, 15, -35), scene);
    camera.attachControl(canvas, true);
    
    camera.keysUp.push(87);    // W
    camera.keysDown.push(83);  // S
    camera.keysLeft.push(65);  // A
    camera.keysRight.push(68); // D

    camera.speed = 0.6;                   // Balanced speed
    camera.inertia = 0.85;                // Smoother stopping
    camera.angularSensibility = 2000;     // Responsive mouse look
    camera.minZ = 0.1;

    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1.8, 1);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 1.8, 0);

    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

    canvas.addEventListener("click", () => {
        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
            if (canvas.requestPointerLock) canvas.requestPointerLock();
        }
    });

    return camera;
}
