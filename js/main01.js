window.addEventListener('load', init, false);
 
var scene, robot,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container, controls;

var key_W = false;
var key_A = false;
var key_S = false;
var key_D = false;
var key_Space = false;

var spacebar_flag = false;
var target = new THREE.Vector3();

function screate_scene() {

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);
	camera.position.x = 0;
	camera.position.z = -900;
	camera.position.y = 100;
	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true 
	});

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	container = document.getElementById('c');
	container.appendChild(renderer.domElement);
	window.addEventListener('resize', handleWindowResize, false);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	// añadidos para mover la cámara con el ratón
	// controls.dispose();
	// controls.update();	
	// document.addEventListener('mousemove', onDocumentMouseMove, false);
}

// function onDocumentMouseMove( event ) {
//     // Manually fire the event in OrbitControls
//     controls.handleMouseMoveRotate(event);
// }

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

function create_lights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	shadowLight.position.set(-100, 250, -200);

	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -4000;
	shadowLight.shadow.camera.right = 4000;
	shadowLight.shadow.camera.top = 4000;
	shadowLight.shadow.camera.bottom = -4000;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 10000;

	// Ajustar estos valores para que se vean bien las sombras
	shadowLight.shadow.normalBias = 0.1;
	shadowLight.shadow.bias = -0.0001;


	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 4096;
	shadowLight.shadow.mapSize.height = 4096;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}




// var model;
// var skyBox;

function init_sky(){
    var urls = [
        'imgs/space_pos_x.jpg',
		'imgs/space_neg_x.jpg',
		'imgs/space_pos_y.jpg',
		'imgs/space_neg_y.jpg',
		'imgs/space_neg_z.jpg',
		'imgs/space_pos_z.jpg',

    ];

	var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    scene.background = reflectionCube;

}



function create_robot(){ 
	
	robot = new Robot('alberto');
	robot.model.position.set(0, 0, 0);
	scene.add(robot.model);
}

function create_environment(){

	var loader = new THREE.TextureLoader()
	
	const comet_texture = loader.load('imgs/comet.jpg');
	var comet_mat = new THREE.MeshStandardMaterial({map: comet_texture, roughness: 1, side: THREE.DoubleSide});

	const moon_texture = loader.load('imgs/moon2.jpg');
	var moon_mat = new THREE.MeshStandardMaterial({map: moon_texture, roughness: 1, side: THREE.DoubleSide});

	const poster_texture = loader.load('imgs/iron_giant.png');
	var poster_mat = new THREE.MeshStandardMaterial({map: poster_texture});

	var lightMat = new THREE.MeshBasicMaterial( { color: 0xffff99} );

	var comet_geom = new THREE.SphereGeometry(15, 32, 16);
	for (var i=0; i<100; i++) {
	  comet = new THREE.Mesh(comet_geom, comet_mat);
	  comet.position.x = Math.random() * 2000 - 900;
	  comet.position.y = Math.random() * 1000 - 100;
	  comet.position.z = Math.random() * 2000 - 900;
	  comet.castShadow = true;
	  comet.receiveShadow = true;
	  scene.add(comet);
	}

	var sum_geom = new THREE.SphereGeometry(300, 32, 16);
	var sun = new THREE.Mesh(sum_geom, lightMat);
	sun.position.set(-1000, 250, -2000);
	scene.add(sun);

	var floor_geom = new THREE.PlaneGeometry(2000, 2000);
	var floor = new THREE.Mesh(floor_geom, moon_mat);
	floor.receiveShadow = true;
	floor.rotation.x = Math.PI * 0.5;
	floor.position.set(0, -199, 0);
	scene.add(floor);

	var poster_geom = new THREE.PlaneGeometry(1300, 636);
	var poster = new THREE.Mesh(poster_geom, poster_mat);
	poster.receiveShadow = true;
	poster.rotation.y = Math.PI;
	poster.position.set(0, 300, 2000);
	scene.add(poster);

}


function init() {

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
	screate_scene();
	create_lights();
	create_robot();
	create_environment();
	init_sky();
	animate();
}

function animate(){
	controls.update();
	movement();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function movement(){
	if(key_Space){
		// cambiar + por - si quieres que mire a cámara...
		target.x = +camera.position.x;
		target.y = +camera.position.y;
		target.z = +camera.position.z;
		scene.getObjectByName("head").lookAt( target );
	}

	if(key_W){
        var direction = new THREE.Vector3();
        robot.model.getWorldDirection(direction);
        robot.model.position.add(direction.multiplyScalar(-3));
		robot.update_pose();
    }
	if(key_A){
        robot.model.rotation.y += 0.04;
		//scene.getObjectByName("head").rotation.y += 0.04
		robot.update_pose();
    }
	if(key_S){
        var direction = new THREE.Vector3();
        robot.model.getWorldDirection(direction);
        robot.model.position.add(direction.multiplyScalar(3));
		robot.update_pose();
    }
    if(key_D){
        robot.model.rotation.y -= 0.04;
		//scene.getObjectByName("head").rotation.y -= 0.04
		robot.update_pose();
    }

}
function handleKeyDown(event){
	switch(event.keyCode){
		case 87:
			key_W = true;
			break;
		case 65:
			key_A = true;
			break;
		case 83:
			key_S = true;
			break;
		case 68:
			key_D = true;
			break;
	}
}

function handleKeyUp(event){
	switch(event.keyCode){
		case 87:
			key_W = false;
			break;
		case 65:
			key_A = false;
			break;
		case 83:
			key_S = false;
			break;
		case 68:
			key_D = false;
			break;
		case 32:
			key_Space = !key_Space;
			break;
	}
}

function readTextFile(image, file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                image.src = allText;
            }
        }
    }
    rawFile.send(null);
}