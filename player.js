export function setupPlayer(scene, canvas) {
    const camera = new BABYLON.UniversalCamera(
        "player",
        new BABYLON.Vector3(0, 15, -35),
        scene
    );

    camera.attachControl(canvas, true);
    
    // WASD Controls setup
    camera.keysUp.push(87);    // W
    camera.keysDown.push(83);  // S
    camera.keysLeft.push(65);  // A
    camera.keysRight.push(68); // D

    // --- Polish: Smoother, more professional FPS feel ---
    camera.speed = 0.8;                   // Slightly faster movement
    camera.inertia = 0.82;                // Smooth deceleration (less abrupt stops)
    camera.angularSensibility = 3000;     // Smooth mouse look (higher = slower/smoother)
    camera.minZ = 0.1;                    // Near clip plane (prevents close-up clipping)

    camera.applyGravity = true;
    camera.checkCollisions = true;
    // Taller ellipsoid: x=width, y=eye-height, z=depth
    camera.ellipsoid = new BABYLON.Vector3(1, 1.8, 1);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 1.8, 0);

    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    // Enter FPS Pointer Lock on click
    canvas.addEventListener("click", () => {
        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }
    });

    return camera;
}