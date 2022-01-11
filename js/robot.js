// Colores, texturas y materiales
var colors = {
	red:0xCA3C38,
	white:0xffffff,
	grey:0xb5b5b5,
	darkGrey: 0x707070,
	darkerGrey: 0x5e5e5e,
	lightYellow: 0xffff99
};

loader = new THREE.TextureLoader();
const metal_texture = loader.load('imgs/metal1.jpg');
const shiny_metal_texture = loader.load('imgs/metal2.jpg');
const dented_metal_texture = loader.load('imgs/metal3.jpg');
const screw_thread_texture = loader.load('imgs/screw_thread.jpg');

var greyMat = new THREE.MeshStandardMaterial({map: shiny_metal_texture, color: colors.white, roughness: 0.5, metalness: 0.4});
var redMat = new THREE.MeshPhongMaterial({color:colors.red, flatShading: true});
var whiteMat = new THREE.MeshPhongMaterial({color:colors.white});
var greyMat = new THREE.MeshStandardMaterial({map: shiny_metal_texture, color: colors.white, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide});
var darkGreyMat = new THREE.MeshPhongMaterial({map: metal_texture, color:colors.darkGrey, side: THREE.DoubleSide, shininess: 5, specular: colors.white});
var darkerGreyMat = new THREE.MeshPhongMaterial({map: dented_metal_texture, color:colors.white, side: THREE.DoubleSide, shininess: 5, specular: colors.white});
var lightMat = new THREE.MeshBasicMaterial( { color: colors.lightYellow} );

var jawMat = new THREE.MeshPhongMaterial({map: metal_texture, color:colors.darkGrey, flatShading: true, side: THREE.DoubleSide, shininess: 7, specular: colors.white});
var screwMat = new THREE.MeshPhongMaterial({map: screw_thread_texture, color:colors.grey, side: THREE.DoubleSide, shininess: 7, specular: colors.white});

// Cargar una textura sobre una forma custom como Extrude
const extrude_texture = loader.load('imgs/metal3.jpg', texture => {
    darkerGreyMat.map = texture;
    darkerGreyMat.needsUpdate = true;
});
extrude_texture.wrapS = extrude_texture.wrapT = THREE.RepeatWrapping;
extrude_texture.repeat.set(0.008, 0.008);

var pose_flag = true; // para las rotaciones al caminar

// Comenzar a crear el robot por partes
var Robot = function() {
	
	// Modelo general
	this.model = new THREE.Object3D();

	// Cabeza
	var head = this.create_head();
	head.scale.set(0.9, 0.9, 0.9);
	head.position.y = 50;
	this.model.add(head);

	// Cuerpo
	var torso = this.create_torso();
	this.model.add(torso);

	// Brazos
	var left_arm = this.create_arm('left_arm');
	left_arm.position.set(-48, -95, 0);
	this.model.add(left_arm);
 
	var right_arm = this.create_arm('right_arm');
	right_arm.position.set(-48, -95, 0);
	right_arm.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1)); // espejo del otro brazo
	this.model.add(right_arm);

	// Piernas
	var left_leg = this.create_leg('left_leg');
	left_leg.position.set(-63, -175, 0);
	this.model.add(left_leg);

	var right_leg = this.create_leg('right_leg');
	right_leg.position.set(-63, -175, 0);
	right_leg.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1)); // espejo de la otra pierna
	this.model.add(right_leg);

	this.model.position.set(0, 0, 0);

	return this;

};

// Cabeza
Robot.prototype.create_head = function() {

	var head = new THREE.Object3D();

	// Forma de la cabeza
	var top_head_geom = new THREE.SphereGeometry(18.7, 64, 64); // parte de arriba (esfera)
	var top_head = new THREE.Mesh(top_head_geom, darkGreyMat);
	top_head.position.y = 15;
	top_head.receiveShadow = true;
	head.add(top_head)

	var bot_head_geom = new THREE.CylinderGeometry( 19, 19, 25, 40, 6 ); // parte de abajo (cilindro)
	var bot_head = new THREE.Mesh(bot_head_geom, darkGreyMat);
	bot_head.position.y = 5;
	bot_head.castShadow = true;

	head.add(bot_head)

	// Ojos
	var right_eye = this.create_eye();
	right_eye.position.set(-10, 10, -11);
	head.add(right_eye);

	var left_eye = this.create_eye();
	left_eye.position.set(10, 10, -11);
	head.add(left_eye);

	// Antena/cresta
	var antenna = this.create_antenna();
	antenna.position.y = 15;
	head.add(antenna);

	// Mandíbula
	var jaw = this.create_jaw();
	jaw.castShadow = true;
	jaw.receiveShadow = true;
	head.add(jaw);

	head.castShadow = true;
	head.receiveShadow = true;

	head.name = "head";

	return head;

}

// Ojo con luz
Robot.prototype.create_eye = function() {
	var eye = new THREE.Object3D();

	var socketGeometry = new THREE.CylinderGeometry( 5, 5, 15, 15, 8);

	var socket = new THREE.Mesh( 
		socketGeometry, 
		greyMat);
	socket.rotation.x = Math.PI / 2;

	eye.add(socket);

	var light = this.create_light();
	light.position.z = -7;
	eye.add(light);

	return eye;
}

// Fuente de luz que se coloca en el ojo
Robot.prototype.create_light = function() {
	var light = new THREE.Object3D();

	var lightSphere = new THREE.Mesh( 
		new THREE.SphereGeometry( 3, 32, 16 ),
		lightMat );
	lightSphere.position.set(0, 0, 0);
	light.add(lightSphere);

	var lightTarget = new THREE.Object3D();
	lightTarget.position.set(0, 0, -100);

	var lightSource = new THREE.SpotLight(0xffffff, 0.7, 1000);
	lightSource.position.set(0, 0, 0);
	lightSource.castShadow = true;
	lightSource.shadow.mapSize.width = 1024;
	lightSource.shadow.mapSize.height = 1024;
	lightSource.shadow.camera.near = 500;
	lightSource.shadow.camera.far = 4000;
	lightSource.shadow.camera.fov = 30;

	lightSource.target = lightTarget;

	light.add(lightTarget);
	light.add(lightSource);	

	return light;
}

// Antena en la cabeza
Robot.prototype.create_antenna = function() {
	var antenna = new THREE.Object3D();

	var left_cone_geom = new THREE.ConeGeometry(22, 7, 64);

	var left_cone = new THREE.Mesh( 
		left_cone_geom, 
		darkerGreyMat);
	left_cone.rotation.z = Math.PI / 2;
	left_cone.position.x = -3.5;

	antenna.add(left_cone);

	var right_cone_geom = new THREE.ConeGeometry(22, 7, 64);

	var right_cone = new THREE.Mesh( 
		right_cone_geom, 
		darkerGreyMat);
	right_cone.rotation.z = - Math.PI / 2;
	right_cone.position.x = 3.5;
	right_cone.castShadow = true;
	right_cone.receiveShadow = true;
	antenna.add(right_cone);

	return antenna;
}

// Mandíbula
Robot.prototype.create_jaw = function() {
	var jaw = new THREE.Object3D();

	var front_jaw_geom = new THREE.CylinderGeometry(24, 24, 15, 4, 6, true, 0, 3.5);
	var front_jaw = new THREE.Mesh(front_jaw_geom, jawMat);
	front_jaw.position.set(0,-10, 0);
	front_jaw.rotation.y = Math.PI * 0.45;
	jaw.add(front_jaw);

	var bot_jaw_geom = new THREE.CylinderGeometry(21.85, 21.85, 5, 10, 6);
	var bot_jaw = new THREE.Mesh(bot_jaw_geom, darkGreyMat);
	bot_jaw.position.set(0,-15, 0);
	bot_jaw.receiveShadow = true;
	jaw.add(bot_jaw);

	// Juntas de la mandíbula y tuercas
	var joint_jaw_geom = new THREE.BoxGeometry(5,30,10,1,1,1);

	var left_joint_jaw = new THREE.Mesh(joint_jaw_geom, darkGreyMat);
	left_joint_jaw.position.set(20, 0, 7);
	jaw.add(left_joint_jaw);

	var right_joint_jaw = new THREE.Mesh(joint_jaw_geom, darkGreyMat);
	right_joint_jaw.position.set(-20, 0, 7);
	jaw.add(right_joint_jaw);

	var bolt_jaw_geom = new THREE.CylinderGeometry(7, 7, 5, 8 );

	var left_bolt_jaw = new THREE.Mesh(bolt_jaw_geom, greyMat);
	left_bolt_jaw.rotation.z = Math.PI * 0.5;
	left_bolt_jaw.position.set(-22, 10, 7);
	jaw.add(left_bolt_jaw);

	var right_bolt_jaw = new THREE.Mesh(bolt_jaw_geom, greyMat);
	right_bolt_jaw.rotation.z = Math.PI * 0.5;
	right_bolt_jaw.position.set(22, 10, 7);
	jaw.add(right_bolt_jaw);

	// Parte de atrás
	var back_jaw_geom = new THREE.CylinderGeometry(19,19,15,32,1, true, 6.28, 2);
	var back_jaw = new THREE.Mesh(back_jaw_geom, darkGreyMat);
	back_jaw.position.set(0, -6, 3);
	back_jaw.rotation.y = Math.PI * -0.325;
	jaw.add(back_jaw);

	return jaw;
}

// Cuerpo
Robot.prototype.create_torso = function(){
	var torso = new THREE.Object3D();

	// Partes del pecho
	var neck_geom = new THREE.CylinderGeometry(12, 12, 20, 32 );
	var neck = new THREE.Mesh(neck_geom, darkGreyMat);
	neck.position.set(0, 30, 0);
	neck.castShadow = true;
	neck.receiveShadow = true;
	torso.add(neck);

	var fin_geom = new THREE.CylinderGeometry(20, 20, 5, 32 );
	var fin1 = new THREE.Mesh(fin_geom, darkGreyMat);
	fin1.position.set(30, 10, 0);
	fin1.rotation.z = Math.PI * 0.5;
	fin1.castShadow = true;
	torso.add(fin1);

	var fin2 = fin1.clone();
	fin2.position.set(-40, 15, 0);
	torso.add(fin2);

	fin3 = fin1.clone()
	fin3.position.set(40, 15, 0);
	torso.add(fin3);

	fin4 = fin1.clone();
	fin4.position.set(-30, 10, 0);
	torso.add(fin4);

	var s_torus_geom = new THREE.TorusGeometry( 15, 1, 4, 100 );
	var s_torus = new THREE.Mesh(s_torus_geom, darkerGreyMat);
	s_torus.position.set(0, 3, -37);
	torso.add(s_torus);

	var s_circle_geom = new THREE.CircleGeometry( 15, 32 );
	var s_circle = new THREE.Mesh(s_circle_geom, greyMat);
	s_circle.position.set(0, 3, -37.2);
	torso.add(s_circle);

	// Añadir "S" cargando una fuente y un texto.
	text_geom = new THREE.FontLoader().load('imgs/helvetiker_bold.typeface.json', function(response) {
  		var font = response;
		var text_geom = new THREE.TextGeometry( 'S', {
			font: font,
			size: 19,
			height: 0.5,
			width: 10,
			curveSegments: 12,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		});
		var text = new THREE.Mesh( text_geom, redMat );
		text.position.set(10, -3, -37.5 );
		text.rotation.y = Math.PI;
		text.rotation.z = Math.PI * -0.1;
		
		torso.add(text);
	});

	var top_torso_shape = new THREE.Shape();
	top_torso_shape.moveTo( 0,0 );
	top_torso_shape.lineTo( 0, 7 );
	top_torso_shape.lineTo( 58, 7 );
	top_torso_shape.lineTo( 58, 0 );
	top_torso_shape.lineTo( 0, 0 );
	var top_torso_settings = {
		steps: 2,
		depth: 33,
		bevelEnabled: true,
		bevelThickness: 20,
		bevelSize: 20,
		bevelOffset: 0,
		bevelSegments: 32
	};
	var top_torso_geom = new THREE.ExtrudeGeometry( top_torso_shape, top_torso_settings );
	var top_torso = new THREE.Mesh( top_torso_geom, Array(6).fill(darkerGreyMat) );
	top_torso.position.set(-29, -6, -17);
	top_torso.castShadow = true;
	top_torso.receiveShadow = true;
	torso.add( top_torso );

	var mid_torso_geom = new THREE.CylinderGeometry(42, 20, 20, 4);
	var mid_torso = new THREE.Mesh(mid_torso_geom, greyMat);
	mid_torso.position.set(0, -30, 0);
	mid_torso.rotation.y = Math.PI * 0.25;
	torso.add(mid_torso);

	var bot_torso_geom = new THREE.CylinderGeometry(20, 20, 50, 32);
	var bot_torso = new THREE.Mesh(bot_torso_geom, screwMat);
	bot_torso.position.set(0, -50, 0);
	bot_torso.castShadow = true;
	torso.add(bot_torso);

	// Pelvis
	var top_pelvis_geom = new THREE.CylinderGeometry(30, 30, 10, 32);
	var top_pelvis = new THREE.Mesh(top_pelvis_geom, darkGreyMat);
	top_pelvis.position.set(0, -70, 0);
	top_pelvis.receiveShadow = true;
	top_pelvis.castShadow = true;
	torso.add(top_pelvis);

	var bot_pelvis_geom = new THREE.SphereGeometry(22, 22, 30, 0, Math.PI * 2, 0, 1.3);
	var bot_pelvis = new THREE.Mesh(bot_pelvis_geom, darkGreyMat);
	bot_pelvis.position.set(0, -69, 0);
	bot_pelvis.rotation.z = Math.PI;
	bot_pelvis.castShadow = true;
	torso.add(bot_pelvis);

	var leg_bar_geom = new THREE.CylinderGeometry(7, 7, 70, 32);
	var leg_bar = new THREE.Mesh(leg_bar_geom, screwMat);
	leg_bar.position.set(0, -75, 0);
	leg_bar.rotation.z = Math.PI * 0.5;
	leg_bar.castShadow = true;
	torso.add(leg_bar);

	return torso;
}

// Crear brazo
Robot.prototype.create_arm = function(input_name){
	var arm = new THREE.Object3D();

	var torus_joint_geom = new THREE.TorusGeometry(10, 3, 100, 100);
	var torus_joint =  new THREE.Mesh(torus_joint_geom, greyMat);
	torus_joint.position.set(100, 100, 0);
	torus_joint.rotation.y = Math.PI * 0.5;
	torus_joint.castShadow = true;
	arm.add(torus_joint);

	var shoulder_joint_geom = new THREE.SphereGeometry( 10, 32, 16 );
	var shoulder_joint =  new THREE.Mesh(shoulder_joint_geom, greyMat);
	shoulder_joint.position.set(107, 100, 0);
	shoulder_joint.rotation.y = Math.PI * 0.5;
	shoulder_joint.castShadow = true;
	arm.add(shoulder_joint);

	var shoulder_top_geom = new THREE.SphereGeometry(25, 32, 16, 0, 1.2, 1, 0.7);
	var shoulder_top = new THREE.Mesh(shoulder_top_geom, darkGreyMat);
	shoulder_top.position.set(105, 88, 0);
	shoulder_top.rotation.z = - Math.PI * 0.5;
	shoulder_top.rotation.x = - Math.PI * 0.2;
	shoulder_top.castShadow = true;
	arm.add(shoulder_top);

	var main_arm_geom = new THREE.CylinderGeometry( 5, 5, 40, 32 );
	var main_arm = new THREE.Mesh(main_arm_geom, darkGreyMat);
	main_arm.position.set(110, 75, 0);
	main_arm.castShadow = true;
	arm.add(main_arm);

	var arm_joint_geom = new THREE.SphereGeometry( 7, 32, 16 );
	var arm_joint =  new THREE.Mesh(arm_joint_geom, greyMat);
	arm_joint.position.set(110, 50, 0);
	arm_joint.castShadow = true;
	arm.add(arm_joint);

	var forearm_geom = new THREE.CylinderGeometry( 5, 10, 40, 32 );
	var forearm = new THREE.Mesh(forearm_geom, darkGreyMat);
	forearm.position.set(110, 30, 0);
	forearm.castShadow = true;
	arm.add(forearm);

	var hand = this.create_hand();
	hand.position.set(110, 9, 0);
	arm.add(hand);

	arm.name = input_name;

	return arm;
}

// Crear mano
Robot.prototype.create_hand = function(){
	var hand = new THREE.Object3D();

	var main_hand_geom = new THREE.SphereGeometry( 9, 32, 16 );
	var main_hand = new THREE.Mesh(main_hand_geom, greyMat);
	main_hand.castShadow = true;
	hand.add(main_hand);

	var finger_geom = new THREE.BoxGeometry( 3, 8, 3 );

	var finger1 = new THREE.Mesh(finger_geom, greyMat); // pulgar 1
	finger1.position.set(-8, -10, 0);
	finger1.rotation.z = Math.PI * -0.2;
	finger1.castShadow = true;
	hand.add(finger1);

	var finger2 = new THREE.Mesh(finger_geom, greyMat); // pulgar 2
	finger2.position.set(-10, -16, 0);
	finger2.castShadow = true;
	hand.add(finger2)

	var finger3 = new THREE.Mesh(finger_geom, greyMat); // anular 1
	finger3.position.set(8, -10, 0);
	finger3.rotation.z = Math.PI * 0.2;
	finger3.castShadow = true;
	hand.add(finger3);

	var finger4 = new THREE.Mesh(finger_geom, greyMat); // anular 2
	finger4.position.set(10, -16, 0);
	finger4.castShadow = true;
	hand.add(finger4)

	var finger5 = new THREE.Mesh(finger_geom, greyMat); // indice 1
	finger5.position.set(6, -9, -7);
	finger5.rotation.z = Math.PI * 0.2;
	finger5.rotation.y = Math.PI * 0.2;
	finger5.castShadow = true;
	hand.add(finger5);

	var finger6 = new THREE.Mesh(finger_geom, greyMat); // indice 2
	finger6.position.set(7.5, -16, -8);
	finger6.castShadow = true;
	hand.add(finger6)

	var finger7 = new THREE.Mesh(finger_geom, greyMat); // meñique 1
	finger7.position.set(6, -9, 7);
	finger7.rotation.z = Math.PI * 0.2;
	finger7.rotation.y = Math.PI * -0.2;
	finger7.castShadow = true;
	hand.add(finger7);

	var finger8 = new THREE.Mesh(finger_geom, greyMat); // meñique 2
	finger8.position.set(7.5, -16, 8);
	finger8.castShadow = true;
	hand.add(finger8)

	return hand;
}

// Crear pierna
Robot.prototype.create_leg = function(input_name){
	var leg = new THREE.Object3D();

	var pelvis_geom = new THREE.CylinderGeometry(12, 12, 15, 32, 1);
	var pelvis = new THREE.Mesh(pelvis_geom, greyMat);
	pelvis.position.set(100, 100, 0);
	pelvis.rotation.z = Math.PI * 0.5;
	pelvis.castShadow = true;
	leg.add(pelvis);

	var pelvis_top_geom = new THREE.SphereGeometry(25, 32, 16, 0, 1.2, 1, 0.7);
	var pelvis_top = new THREE.Mesh(pelvis_top_geom, darkGreyMat);
	pelvis_top.position.set(95, 91, 0);
	pelvis_top.rotation.z = - Math.PI * 0.5;
	pelvis_top.rotation.x = - Math.PI * 0.2;
	pelvis_top.castShadow = true;
	leg.add(pelvis_top);

	var main_leg_geom = new THREE.CylinderGeometry( 5, 5, 65, 32 );
	var main_leg = new THREE.Mesh(main_leg_geom, darkGreyMat);
	main_leg.position.set(100, 70, 0);
	main_leg.castShadow = true;
	leg.add(main_leg);

	var knee_geom = new THREE.SphereGeometry( 7, 32, 16 );
	var knee =  new THREE.Mesh(knee_geom, greyMat);
	knee.position.set(100, 35, 0);
	knee.castShadow = true;
	leg.add(knee);

	var sec_leg_geom = new THREE.CylinderGeometry( 5, 8, 45, 32 );
	var sec_leg = new THREE.Mesh(sec_leg_geom, darkGreyMat);
	sec_leg.position.set(100, 10, 0);
	sec_leg.castShadow = true;
	leg.add(sec_leg);

	var foot_geom = new THREE.BoxGeometry(18,12,25);
	var foot = new THREE.Mesh(foot_geom, darkGreyMat);
	foot.position.set(100, -18, -3);
	foot.castShadow = true;
	leg.add(foot);	

	var fingers_geom = new THREE.CylinderGeometry(12,12, 18, 32, 1, false, 0, Math.PI/2);
	var fingers = new THREE.Mesh(fingers_geom, darkGreyMat);
	fingers.position.set(100, -24, -15.5);
	fingers.rotation.z = Math.PI * 0.5;
	fingers.rotation.y = Math.PI;
	fingers.castShadow = true;
	leg.add(fingers);

	var sole_geom = new THREE.PlaneGeometry(18, 13, 1, 1);
	var sole = new THREE.Mesh(sole_geom, darkGreyMat);
	sole.position.set(100, -24, -21);
	sole.rotation.x = Math.PI * 0.5;
	sole.castShadow = true;
	leg.add(sole);

	leg.name = input_name;

	return leg;

}


// Actualizar postura para mostrar movimiento
Robot.prototype.update_pose = function() {

	if(pose_flag){
		rotate_over_point(this.model.children[2], new THREE.Vector3(-55, 5, 0), new THREE.Vector3(1,0,0), -Math.PI*0.01); // brazo izquierdo
		rotate_over_point(this.model.children[3], new THREE.Vector3(-55, 5, 0), new THREE.Vector3(1,0,0), Math.PI*0.01); // brazo derecho
		rotate_over_point(this.model.children[4], new THREE.Vector3(40, -75, 0), new THREE.Vector3(1,0,0), Math.PI*0.01); // pierna izquierda
		rotate_over_point(this.model.children[5], new THREE.Vector3(-40, -75, 0), new THREE.Vector3(1,0,0), -Math.PI*0.01); // pierna derecha
		if(this.model.children[2].rotation.x < -0.6){
			pose_flag = false;
		}
	}
	else{
		rotate_over_point(this.model.children[2], new THREE.Vector3(-55, 5, 0), new THREE.Vector3(1,0,0), Math.PI*0.01); // brazo izquierdo
		rotate_over_point(this.model.children[3], new THREE.Vector3(-55, 5, 0), new THREE.Vector3(1,0,0), -Math.PI*0.01); // brazo derecho
		rotate_over_point(this.model.children[4], new THREE.Vector3(40, -75, 0), new THREE.Vector3(1,0,0), -Math.PI*0.01); // pierna izquierda
		rotate_over_point(this.model.children[5], new THREE.Vector3(-40, -75, 0), new THREE.Vector3(1,0,0), Math.PI*0.01); // pierna derecha
		if(this.model.children[2].rotation.x > 0.6){
			pose_flag = true;
		}
	}

}

// Función auxiliar para rotar sobre un punto: mover al origen, rotar y mover al inicio.
function rotate_over_point(obj, point, axis, theta){
    obj.position.sub(point);
    obj.position.applyAxisAngle(axis, theta);
    obj.position.add(point);
    obj.rotateOnAxis(axis, theta);
}

