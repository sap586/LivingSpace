import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

////////////////////////////////////////////////////////
// SCENE
////////////////////////////////////////////////////////

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

////////////////////////////////////////////////////////
// CAMERA
////////////////////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 70, 0.01);

let productionRadius = 35;

const PRODUCTION_MIN_RADIUS = 20;
const PRODUCTION_MAX_RADIUS = 160;

let productionYaw = 0;
let productionPitch = 0.35;

let mouseDown = false;

////////////////////////////////////////////////////////
// RENDERER
////////////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);

////////////////////////////////////////////////////////
// LIGHTING
////////////////////////////////////////////////////////

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        2
    )
);

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    30,
    50,
    30
);

scene.add(sun);

////////////////////////////////////////////////////////
// FLOOR
////////////////////////////////////////////////////////

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(
        40,
        50
    ),
    new THREE.MeshStandardMaterial({
        color:0x303030
    })
);

floor.rotation.x = -Math.PI / 2;

scene.add(floor);

////////////////////////////////////////////////////////
// FEEDER BOTTOM
////////////////////////////////////////////////////////

const feederBottom = new THREE.Mesh(
    new THREE.BoxGeometry(
        40,
        1,
        10
    ),
    new THREE.MeshStandardMaterial({
        color:0x0066ff
    })
);

feederBottom.position.set(
    0,
    0.5,
    -20
);

scene.add(feederBottom);

////////////////////////////////////////////////////////
// FEEDER TOP
////////////////////////////////////////////////////////

const feederTop = feederBottom.clone();

feederTop.position.z = 20;

scene.add(feederTop);

////////////////////////////////////////////////////////
// PCB AREA
////////////////////////////////////////////////////////

const pcbArea = new THREE.Mesh(
    new THREE.BoxGeometry(
        35,
        1,
        18
    ),
    new THREE.MeshStandardMaterial({
        color:0x00aa55
    })
);

pcbArea.position.set(
    0,
    0.5,
    0
);

scene.add(pcbArea);

////////////////////////////////////////////////////////
// GANTRY RAILS
////////////////////////////////////////////////////////

const railMaterial =
new THREE.MeshStandardMaterial({
    color:0xbbbbbb
});

const rail1 = new THREE.Mesh(
    new THREE.BoxGeometry(
        45,
        1,
        1
    ),
    railMaterial
);

rail1.position.set(
    0,
    0,
    -8
);

scene.add(rail1);

const rail2 = rail1.clone();

rail2.position.z = 8;

scene.add(rail2);

////////////////////////////////////////////////////////
// GANTRY
////////////////////////////////////////////////////////

const gantry = new THREE.Group();

const beam = new THREE.Mesh(
    new THREE.BoxGeometry(
        2,
        2,
        18
    ),
    new THREE.MeshStandardMaterial({
        color:0xff8800
    })
);

gantry.add(beam);

////////////////////////////////////////////////////////
// HEAD
////////////////////////////////////////////////////////

const head = new THREE.Mesh(
    new THREE.BoxGeometry(
        2,
        2,
        2
    ),
    new THREE.MeshStandardMaterial({
        color:0xff3333
    })
);

head.position.y = -2;

gantry.add(head);

////////////////////////////////////////////////////////
// NOZZLE
////////////////////////////////////////////////////////

const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(
        0.4,
        0.4,
        4
    ),
    new THREE.MeshStandardMaterial({
        color:0xffff00
    })
);

nozzle.position.y = -5;

gantry.add(nozzle);

gantry.position.y = 12;

scene.add(gantry);

////////////////////////////////////////////////////////
// PART
////////////////////////////////////////////////////////

function createPart(color = 0xffffff)
{
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
            1,
            1,
            1
        ),
        new THREE.MeshStandardMaterial({
            color
        })
    );

    scene.add(mesh);

    return mesh;
}

let movingPart = createPart();

////////////////////////////////////////////////////////
// PLACEMENTS
////////////////////////////////////////////////////////

const placements = [
    [-10,-3],
    [-8,4],
    [-3,-2],
    [0,2],
    [3,-4],
    [8,3],
    [11,-1]
];

let placementIndex = 0;
let carried = false;

const placedParts = [];

////////////////////////////////////////////////////////
// MACHINE STATE
////////////////////////////////////////////////////////

let machineRunning = true;
let state = "moveToPick";

////////////////////////////////////////////////////////
// CAMERA STATE
////////////////////////////////////////////////////////

let viewMode = "top";
let topAngle = 0;
let targetTopAngle = 0;
let productionViewIndex = 0;
const productionViews =
[
    { x:  0, y:18, z:-35 },
    { x: 15, y:18, z:-35 },
    { x: 30, y:18, z:-35 },
    { x:-15, y:18, z:-35 },
    { x:-30, y:18, z:-35 }
];

const productionAngleStep = Math.PI / 4;
	
	

////////////////////////////////////////////////////////
// UI FUNCTIONS
////////////////////////////////////////////////////////

window.startMachine = () =>
{
    machineRunning = true;
};

window.stopMachine = () =>
{
    machineRunning = false;
};

window.setTopView = () =>
{
	console.log("setTopView - current view : " + viewMode);
	if (viewMode == "top")
	{
		targetTopAngle += Math.PI;
	}
    viewMode = "top";
};

window.setProductionView = () =>
{
	console.log("setProductionView - current view : " + viewMode);
	if (viewMode == "production")
	{
		productionViewIndex++;

        if(productionViewIndex >= 4)
        {
            productionViewIndex = 0;
        }
	}
    viewMode = "production";
};

////////////////////////////////////////////////////////
// MACHINE CYCLE
////////////////////////////////////////////////////////

function machineCycle()
{
    const pickX = 0;
    const pickZ = -20;

    const target =
        placements[
            placementIndex %
            placements.length
        ];

    const placeX = target[0];
    const placeZ = target[1];

    ////////////////////////////////////////////////////
    // MOVE TO PICK
    ////////////////////////////////////////////////////

    if(state === "moveToPick")
    {
        gantry.position.x +=
            (pickX - gantry.position.x) * 0.05;

        gantry.position.z +=
            (pickZ - gantry.position.z) * 0.05;

        if(
            Math.abs(gantry.position.x - pickX) < 0.2 &&
            Math.abs(gantry.position.z - pickZ) < 0.2
        )
        {
            state = "pick";
        }
    }

    ////////////////////////////////////////////////////
    // PICK
    ////////////////////////////////////////////////////

    else if(state === "pick")
    {
        nozzle.scale.y +=
            (2 - nozzle.scale.y) * 0.1;

        if(nozzle.scale.y > 1.95)
        {
            carried = true;
            state = "moveToPlace";
        }
    }

    ////////////////////////////////////////////////////
    // MOVE TO PLACE
    ////////////////////////////////////////////////////

    else if(state === "moveToPlace")
    {
        nozzle.scale.y +=
            (1 - nozzle.scale.y) * 0.1;

        gantry.position.x +=
            (placeX - gantry.position.x) * 0.05;

        gantry.position.z +=
            (placeZ - gantry.position.z) * 0.05;

        if(
            Math.abs(gantry.position.x - placeX) < 0.2 &&
            Math.abs(gantry.position.z - placeZ) < 0.2
        )
        {
            state = "place";
        }
    }

    ////////////////////////////////////////////////////
    // PLACE
    ////////////////////////////////////////////////////

    else if(state === "place")
    {
        nozzle.scale.y +=
            (2 - nozzle.scale.y) * 0.1;

        if(nozzle.scale.y > 1.95)
        {
            const placed =
                createPart(
                    0x00ffff
                );

            placed.position.set(
                placeX,
                1,
                placeZ
            );

            placedParts.push(
                placed
            );

            if(
                placedParts.length > 50
            )
            {
                scene.remove(
                    placedParts.shift()
                );
            }

            scene.remove(
                movingPart
            );

            movingPart =
                createPart();

            carried = false;

            placementIndex++;

            state = "moveToPick";
        }
    }

    ////////////////////////////////////////////////////
    // PART FOLLOWS HEAD
    ////////////////////////////////////////////////////

    if(carried)
    {
        movingPart.position.set(
            gantry.position.x,
            6,
            gantry.position.z
        );
    }
    else
    {
        movingPart.position.set(
            0,
            2,
            -20
        );
    }
}

////////////////////////////////////////////////////////
// ANIMATION
////////////////////////////////////////////////////////

function animate()
{
    requestAnimationFrame(
        animate
    );

    if(machineRunning)
    {
        machineCycle();
    }

    if(viewMode === "top")
    {
		topAngle += (targetTopAngle - topAngle) * 0.05;
		camera.position.set(0, 70, 0);
		camera.up.set(Math.sin(topAngle), 0, Math.cos(topAngle));
		
		camera.lookAt(0,0,0);
    }
    else
    {
		/*
		const angle =
			productionViewIndex *
			productionAngleStep;
		
		const radius = productionRadius;

		const targetX =
			Math.sin(angle) * radius;

		const targetZ =
		   -Math.cos(angle) * radius;

		camera.position.x +=
			(targetX - camera.position.x) * 0.05;

		camera.position.y +=
			(18 - camera.position.y) * 0.05;

		camera.position.z +=
			(targetZ - camera.position.z) * 0.05;
		*/
			
		const targetX =
			Math.cos(productionPitch) *
			Math.sin(productionYaw) *
			productionRadius;

		const targetY =
			Math.sin(productionPitch) *
			productionRadius;

		const targetZ =
			Math.cos(productionPitch) *
			Math.cos(productionYaw) *
			productionRadius;

		camera.position.x +=
			(targetX - camera.position.x) * 0.1;

		camera.position.y +=
			(targetY - camera.position.y) * 0.1;

		camera.position.z +=
			(targetZ - camera.position.z) * 0.1;

		camera.lookAt(
			0,
			5,
			0
		);

    }

    renderer.render(
        scene,
        camera
    );
}

animate();

document.addEventListener("keydown", (event) =>
{
    if(event.key.toLowerCase() === "p")
    {
        setProductionView();
    }
});

////////////////////////////////////////////////////////
// RESIZE
////////////////////////////////////////////////////////

window.addEventListener(
    "resize",
    () =>
    {
        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


window.addEventListener("wheel", (event) =>
{
    if(viewMode !== "production")
    {
        return;
    }

    if(event.deltaY > 0)
    {
        productionRadius += 2;
    }
    else
    {
        productionRadius -= 2;
    }

    productionRadius = Math.max(
        PRODUCTION_MIN_RADIUS,
        Math.min(
            PRODUCTION_MAX_RADIUS,
            productionRadius
        )
    );

    console.log(
        "Production Zoom: " +
        productionRadius
    );
});

window.addEventListener("mousedown", (e) =>
{
    if(viewMode !== "production")
        return;

    if(e.button === 0)
        mouseDown = true;
});

window.addEventListener("mouseup", () =>
{
    mouseDown = false;
});

window.addEventListener("mousemove", (e) =>
{
    if(viewMode !== "production")
        return;

    if(!mouseDown)
        return;

    productionYaw +=
        e.movementX * 0.01;

    productionPitch -=
        e.movementY * 0.01;

    productionPitch =
        Math.max(
            0.1,
            Math.min(
                1.2,
                productionPitch
            )
        );
});
