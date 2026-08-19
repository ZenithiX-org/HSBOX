export let currentWeaponMode = "shoot";
export let currentColor = new BABYLON.Color3(1, 0, 0);
let weldTargetA = null;

export function setWeaponMode(mode, colorHex) {
    currentWeaponMode = mode;
    if (colorHex) currentColor = BABYLON.Color3.FromHexString(colorHex);
    weldTargetA = null;

    const indicator = document.getElementById("tool-indicator");
    if (indicator) {
        const labels = { shoot: "🔫 Shoot", delete: "💥 Delete", color: "🎨 Color", weld: "🔗 Weld" };
        indicator.textContent = labels[mode] || mode;
        indicator.classList.add("tool-flash");
        setTimeout(() => indicator.classList.remove("tool-flash"), 300);
    }
}

let heldObject = null;
const HOLD_DISTANCE = 6;
const GRAB_STIFFNESS = 15; // How strongly it pulls to the hand

export function setupWeapons(scene, camera) {
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("mousedown", (e) => {
        if (e.button === 2) { // Right Click: Grab
            const ray = camera.getForwardRay();
            const hit = scene.pickWithRay(ray);
            if (hit.pickedMesh?.physicsImpostor && hit.pickedMesh.physicsImpostor.mass > 0) {
                heldObject = hit.pickedMesh;
                // Damping: Make the object heavier while holding so it doesn't spin wildly
                heldObject.physicsImpostor.friction = 0.8; 
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
        if (e.button === 2 && heldObject) {
            // Restore friction when released
            if(heldObject.physicsImpostor) heldObject.physicsImpostor.friction = 0.5;
            heldObject = null;
        }
    });

    // 🛠️ FIX: Physics Grab Logic (Velocity Based)
    scene.onBeforeRenderObservable.add(() => {
        if (heldObject && heldObject.physicsImpostor) {
            const targetPos = camera.position.add(camera.getForwardRay().direction.scale(HOLD_DISTANCE));
            const currentPos = heldObject.getAbsolutePosition();
            
            // Calculate error vector (Where we want to be - Where we are)
            const error = targetPos.subtract(currentPos);
            
            // Apply velocity proportional to the error (Spring physics)
            // This respects collisions and mass, unlike setting position directly
            const velocity = error.scale(GRAB_STIFFNESS);
            heldObject.physicsImpostor.setLinearVelocity(velocity);
            
            // Stop spinning while holding
            heldObject.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        }
    });
}

function shootProjectile(scene, camera) {
    const sphere = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.4, segments: 8 }, scene);
    sphere.position = camera.getFrontPosition(2);
    
    const mat = new BABYLON.PBRMaterial("bulletMat", scene);
    mat.albedoColor = new BABYLON.Color3(1, 0.5, 0); // Orange
    mat.emissiveColor = new BABYLON.Color3(1, 0.3, 0); // Glow
    mat.metallic = 0;
    mat.roughness = 0.5;
    sphere.material = mat;

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2, restitution: 0.5 }, scene);
    const force = camera.getForwardRay().direction.scale(80);
    sphere.physicsImpostor.applyImpulse(force, sphere.getAbsolutePosition());
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
        // Reuse existing PBR material if possible, or create new
        let mat = hit.pickedMesh.material;
        if (!mat || mat.getClassName() !== "PBRMaterial") {
            mat = new BABYLON.PBRMaterial("colorMat", scene);
            mat.metallic = 0.5;
            mat.roughness = 0.5;
        }
        mat.albedoColor = currentColor.clone();
        hit.pickedMesh.material = mat;
    }
}

function weldProps(scene, camera) {
    const hit = scene.pickWithRay(camera.getForwardRay());
    if (hit.pickedMesh?.physicsImpostor) {
        if (!weldTargetA) {
            weldTargetA = hit.pickedMesh;
            if (weldTargetA.material && weldTargetA.material.emissiveColor) {
                weldTargetA.material.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
            }
        } else {
            if (weldTargetA !== hit.pickedMesh) {
                const joint = new BABYLON.DistanceJoint({ distance: BABYLON.Vector3.Distance(weldTargetA.position, hit.pickedMesh.position) });
                weldTargetA.physicsImpostor.addJoint(hit.pickedMesh.physicsImpostor, joint);
                if (weldTargetA.material && weldTargetA.material.emissiveColor) {
                    weldTargetA.material.emissiveColor = BABYLON.Color3.Black();
                }
            }
            weldTargetA = null;
        }
    }
}
