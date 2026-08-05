export let currentWeaponMode = "shoot";
export let currentColor = new BABYLON.Color3(1, 0, 0);
let weldTargetA = null;

export function setWeaponMode(mode, colorHex) {
    currentWeaponMode = mode;
    if (colorHex) currentColor = BABYLON.Color3.FromHexString(colorHex);
    weldTargetA = null;

    const indicator = document.getElementById("tool-indicator");
    if (indicator) {
        const labels = {
            shoot: "🔫 Shoot",
            delete: "💥 Delete",
            color: "🎨 Color",
            weld: "🔗 Weld"
        };
        indicator.textContent = labels[mode] || mode;
        indicator.classList.add("tool-flash");
        setTimeout(() => indicator.classList.remove("tool-flash"), 300);
    }
}

let heldObject = null;
let holdDistance = 7;

export function setupWeapons(scene, camera) {
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("mousedown", (e) => {
        if (e.button === 2) { // Right click (Grab)
            const ray = camera.getForwardRay();
            const hit = scene.pickWithRay(ray);
            if (hit.pickedMesh?.physicsImpostor && hit.pickedMesh.physicsImpostor.mass > 0) {
                heldObject = hit.pickedMesh;
            }
        }
        if (e.button === 0) {
            if (document.pointerLockElement !== null) {
                if (currentWeaponMode === "shoot") shootProjectile(scene, camera);
                if (currentWeaponMode === "delete") deleteProp(scene, camera);
                if (currentWeaponMode === "color") colorProp(scene, camera);
                if (currentWeaponMode === "weld") weldProps(scene, camera);
            }
        }
    });

    window.addEventListener("mouseup", (e) => {
        if (e.button === 2) heldObject = null;
    });

    scene.onBeforeRenderObservable.add(() => {
        if (heldObject) {
            const targetPos = camera.position.add(camera.getForwardRay().direction.scale(holdDistance));
            const lerpFactor = 0.1;
            heldObject.position = BABYLON.Vector3.Lerp(heldObject.position, targetPos, lerpFactor);
            if (heldObject.physicsImpostor) {
                heldObject.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
                heldObject.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
            }
        }
    });

    // Optimized: Use observable with delta time for smoother physics
    let lastTime = 0;
    scene.onAfterRenderObservable.add(() => {
        const now = performance.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        
        // Cleanup distant or old projectiles to reduce memory
        scene.meshes.forEach(mesh => {
            if (mesh.name === "bullet" && mesh.position.subtract(camera.position).length() > 500) {
                mesh.dispose();
            }
        });
    });
}

function shootProjectile(scene, camera) {
    // Optimized: Lower segment count for bullets
    const sphere = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.4, segments: 8 }, scene);
    sphere.position = camera.getFrontPosition(2);
    const mat = new BABYLON.StandardMaterial("bulletMat", scene);
    mat.emissiveColor = new BABYLON.Color3(1, 0.6, 0);
    sphere.material = mat;

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2, restitution: 0.5 }, scene);
    const force = camera.getForwardRay().direction.scale(60);
    sphere.physicsImpostor.applyImpulse(force, sphere.getAbsolutePosition());
    // Optimized: Shorter cleanup time for projectiles
    setTimeout(() => sphere.dispose(), 3000);
}

function deleteProp(scene, camera) {
    const hit = scene.pickWithRay(camera.getForwardRay());
    if (hit.pickedMesh?.physicsImpostor && hit.pickedMesh.physicsImpostor.mass > 0) {
        hit.pickedMesh.dispose();
    }
}

function colorProp(scene, camera) {
    const hit = scene.pickWithRay(camera.getForwardRay());
    if (hit.pickedMesh) {
        const mat = new BABYLON.StandardMaterial("colorMat", scene);
        mat.diffuseColor = currentColor.clone();
        hit.pickedMesh.material = mat;
    }
}

function weldProps(scene, camera) {
    const hit = scene.pickWithRay(camera.getForwardRay());
    if (hit.pickedMesh?.physicsImpostor) {
        if (!weldTargetA) {
            weldTargetA = hit.pickedMesh;
            if (weldTargetA.material) weldTargetA.material.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
        } else {
            if (weldTargetA !== hit.pickedMesh) {
                const joint = new BABYLON.DistanceJoint({ distance: BABYLON.Vector3.Distance(weldTargetA.position, hit.pickedMesh.position) });
                weldTargetA.physicsImpostor.addJoint(hit.pickedMesh.physicsImpostor, joint);
                if (weldTargetA.material) weldTargetA.material.emissiveColor = BABYLON.Color3.Black();
            }
            weldTargetA = null;
        }
    }
}