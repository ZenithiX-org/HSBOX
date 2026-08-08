export function setupPhysics(scene) {
    scene.enablePhysics(
        new BABYLON.Vector3(0, -9.8, 0),
        new BABYLON.CannonJSPlugin()
    );
}

export function createCube(scene, camera) {
    const cube = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    cube.position = camera.position.add(camera.getForwardRay().direction.scale(5));

    // Optimized: Reuse material pool or use simpler material
    const mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    mat.specularPower = 64;
    cube.material = mat;

    cube.physicsImpostor = new BABYLON.PhysicsImpostor(
        cube,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 1, restitution: 0.4, friction: 0.5 },
        scene
    );

    return cube;
}

export function createSphere(scene, camera) {
    // Optimized: Lower segment count for spawned spheres
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 12 }, scene);
    sphere.position = camera.position.add(camera.getForwardRay().direction.scale(5));

    const mat = new BABYLON.StandardMaterial("sphereMat", scene);
    mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    mat.specularPower = 64;
    sphere.material = mat;

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
        sphere,
        BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 1, restitution: 0.6, friction: 0.3 },
        scene
    );

    return sphere;
}

export function createCylinder(scene, camera) {
    // Optimized: Lower tessellation for cylinders
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 2, tessellation: 12 }, scene);
    cylinder.rotation.x = Math.random() * Math.PI;
    cylinder.rotation.z = Math.random() * Math.PI;
    cylinder.position = camera.position.add(camera.getForwardRay().direction.scale(5));

    const mat = new BABYLON.StandardMaterial("cylMat", scene);
    mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    cylinder.material = mat;

    cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(
        cylinder,
        BABYLON.PhysicsImpostor.CylinderImpostor,
        { mass: 1, restitution: 0.2, friction: 0.6 },
        scene
    );

    return cylinder;
}