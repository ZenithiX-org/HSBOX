export function buildWorld(scene, shadowGen) {
    // High-Tech Grid Material
    const gridMat = new BABYLON.GridMaterial("gridMat", scene);
    gridMat.majorUnitFrequency = 5;
    gridMat.minorUnitVisibility = 0.2;
    gridMat.gridRatio = 1;
    gridMat.mainColor = new BABYLON.Color3(0.02, 0.02, 0.03); // Very dark floor
    gridMat.lineColor = new BABYLON.Color3(0.1, 0.5, 0.9);    // Cyan lines
    gridMat.opacity = 0.98;

    function createStaticBox(name, size, position, rotation = BABYLON.Vector3.Zero()) {
        const box = BABYLON.MeshBuilder.CreateBox(name, size, scene);
        box.position = position;
        box.rotation = rotation;
        box.material = gridMat;
        box.receiveShadows = true;
        box.checkCollisions = true;

        if (shadowGen) shadowGen.addShadowCaster(box);

        box.physicsImpostor = new BABYLON.PhysicsImpostor(
            box, BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.4, friction: 0.8 }, scene // High friction for walls/floor
        );
        return box;
    }

    createStaticBox("floor", { width: 100, height: 2, depth: 100 }, new BABYLON.Vector3(0, -1, 0));
    const wallHeight = 20;
    const wallThick = 2;
    createStaticBox("wallN", { width: 100, height: wallHeight, depth: wallThick }, new BABYLON.Vector3(0, wallHeight/2, 50));
    createStaticBox("wallS", { width: 100, height: wallHeight, depth: wallThick }, new BABYLON.Vector3(0, wallHeight/2, -50));
    createStaticBox("wallE", { width: wallThick, height: wallHeight, depth: 100 }, new BABYLON.Vector3(50, wallHeight/2, 0));
    createStaticBox("wallW", { width: wallThick, height: wallHeight, depth: 100 }, new BABYLON.Vector3(-50, wallHeight/2, 0));

    createStaticBox("centerPlatform", { width: 20, height: 4, depth: 20 }, new BABYLON.Vector3(0, 2, 0));
    const rampAngle = Math.PI / 8;
    createStaticBox("rampNorth", { width: 10, height: 2, depth: 18 }, new BABYLON.Vector3(0, 1.8, 18), new BABYLON.Vector3(rampAngle, 0, 0));
    createStaticBox("rampSouth", { width: 10, height: 2, depth: 18 }, new BABYLON.Vector3(0, 1.8, -18), new BABYLON.Vector3(-rampAngle, 0, 0));

    for (let i = 0; i < 8; i++) {
        createStaticBox(`step${i}`, { width: 10, height: 1.5, depth: 3 }, new BABYLON.Vector3(-40, (i * 1.5) + 0.75, -40 + (i * 3)));
    }
}

export function buildFootballField(scene, shadowGen) {
    const ground = BABYLON.MeshBuilder.CreateGround("footballGround", { width: 200, height: 300 }, scene);
    const groundMat = new BABYLON.StandardMaterial("footballGroundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.45, 0.15); // Grass green
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Less shiny grass
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.9 }, scene);

    const postMat = new BABYLON.StandardMaterial("postMat", scene);
    postMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    
    const createGoal = (zPos) => {
        const p1 = BABYLON.MeshBuilder.CreateCylinder("p1", { height: 12, diameter: 0.6 }, scene);
        p1.position = new BABYLON.Vector3(-15, 6, zPos);
        const p2 = BABYLON.MeshBuilder.CreateCylinder("p2", { height: 12, diameter: 0.6 }, scene);
        p2.position = new BABYLON.Vector3(15, 6, zPos);
        const bar = BABYLON.MeshBuilder.CreateCylinder("bar", { height: 30, diameter: 0.6 }, scene);
        bar.position = new BABYLON.Vector3(0, 12, zPos);
        bar.rotation.z = Math.PI / 2;

        [p1,p2,bar].forEach(m => {
            m.material = postMat;
            m.physicsImpostor = new BABYLON.PhysicsImpostor(m, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 }, scene);
            if(shadowGen) shadowGen.addShadowCaster(m);
        });
    }
    createGoal(149); createGoal(-149);

    const ball = BABYLON.MeshBuilder.CreateSphere("soccerBall", { diameter: 8, segments: 24 }, scene);
    ball.position = new BABYLON.Vector3(0, 10, 0);
    const ballMat = new BABYLON.PBRMaterial("ballMat", scene);
    ballMat.albedoColor = new BABYLON.Color3(1, 1, 1);
    ballMat.roughness = 0.8; // Matte ball
    ball.material = ballMat;
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 40, restitution: 0.8, friction: 0.3 }, scene);
}

export function buildOpenField(scene, shadowGen) {
    const ground = BABYLON.MeshBuilder.CreateGround("openGround", { width: 2000, height: 2000 }, scene);
    const groundMat = new BABYLON.GridMaterial("openGrid", scene);
    groundMat.gridRatio = 10;
    groundMat.majorUnitFrequency = 5;
    groundMat.mainColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    groundMat.lineColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.8 }, scene);
}

export function loadCustomMap(scene, shadowGen, filename, camera) {
    BABYLON.SceneLoader.ImportMeshAsync("", "./", filename, scene).then((result) => {
        result.meshes.forEach(mesh => {
            if (mesh.getTotalVertices() > 0) {
                mesh.receiveShadows = true;
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0 }, scene);
                if (shadowGen) shadowGen.addShadowCaster(mesh);
            }
        });
    }).catch(err => {
        console.error("Failed to load custom map:", err);
    });
}
