// Listeners para las teclas y el inicio del programa
window.addEventListener('load', init, false);
window.addEventListener('keydown', handle_key_down, true)
window.addEventListener('keyup', handle_key_up, true)

// Variables globales
var scene, robot,
		camera, fov, aspect_ratio, near_plane, far_plane, HEIGHT, WIDTH,
		renderer, container, controls, hemisphereLight, shadowLight;

var key_W, key_A, key_S, key_D, key_Space = false;

var target = new THREE.Vector3(); // Para mover la cabeza con la cámara

// Iniciar el programa
function init() {
	create_scene();
	create_lights();
	create_robot();
	create_environment();
	init_sky();
	animate();
}

// Crear la escena en general y añadir los controles de cámara.
function create_scene() {

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	aspect_ratio = WIDTH / HEIGHT;
	fov = 60;
	near_plane = 1;
	far_plane = 10000;
	camera = new THREE.PerspectiveCamera(
		fov,
		aspect_ratio,
		near_plane,
		far_plane
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
	window.addEventListener('resize', handle_window_resize, false);

	// Librería auxiliar
	controls = new THREE.OrbitControls(camera, renderer.domElement);
}

// Actualizar la cámara, altura y anchura si se modifica el tamaño de la ventana
function handle_window_resize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

// Luces de la escena
function create_lights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9) // Luz ambiente
	shadowLight = new THREE.DirectionalLight(0xffffff, .9); // Luz del "sol" direccional

	shadowLight.position.set(-100, 250, -200);
	shadowLight.castShadow = true;

	// Area para proyectar las sombras
	shadowLight.shadow.camera.left = -4000;
	shadowLight.shadow.camera.right = 4000;
	shadowLight.shadow.camera.top = 4000;
	shadowLight.shadow.camera.bottom = -4000;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 10000;

	// Ajustar estos valores para que se vean bien las sombras
	shadowLight.shadow.normalBias = 0.1;
	shadowLight.shadow.bias = -0.0001;

	// Resolución de las sombras: si va mal, reducirla
	shadowLight.shadow.mapSize.width = 4096;
	shadowLight.shadow.mapSize.height = 4096;
	
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

// Cargar las texturas del fondo
function init_sky(){
	// Imágenes/texturas
    var urls = [
        'imgs/space_pos_x.jpg',
		'imgs/space_neg_x.jpg',
		'imgs/space_pos_y.jpg',
		'imgs/space_neg_y.jpg',
		'imgs/space_neg_z.jpg',
		'imgs/space_pos_z.jpg',

    ];
	var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    scene.background = reflectionCube; // Añadirlas al background

}

// Crear el objeto Robot y añadirlo
function create_robot(){ 
	robot = new Robot();
	robot.model.position.set(0, 0, 0);
	scene.add(robot.model);
}

// Crear el suelo, los asteroides y el poster
function create_environment(){

	var loader = new THREE.TextureLoader()
	
	const comet_texture = loader.load('imgs/comet.jpg');
	var comet_mat = new THREE.MeshStandardMaterial({map: comet_texture, roughness: 1, side: THREE.DoubleSide});

	const moon_texture = loader.load('imgs/moon.jpg');
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

// Animar el robot
function animate(){
	controls.update();
	movement();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

// Con los controles, animar el movimiento
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
		robot.update_pose();
    }

}

// Funciones auxiliares para las teclas
function handle_key_down(event){
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

function handle_key_up(event){
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