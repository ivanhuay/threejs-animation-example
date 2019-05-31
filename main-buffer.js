var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var cubes = [];
scene.background = new THREE.Color( 0x505050 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial({
  color: 0x00ff00
});
material.color.convertSRGBToLinear();
camera.position.set(4,30,5);
var controls = new THREE.OrbitControls( camera );
controls.keys = {
  LEFT: 65,
	UP: 87,
	RIGHT: 68,
	BOTTOM: 83
}
controls.update();
// var customControls = new CustomControls(camera);
var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 3, 3, 5);

scene.add( light );
var light2 = new THREE.AmbientLight( 0xabababa, 0.6 );
scene.add( light2 );

function getHight(x,z){
  // console.log(':',x,z);
  // var arg = (Math.pow(x,2)+Math.pow(z,2),0.5);
  // return Math.pow(arg)*Math.sin(arg)/arg;
  return Math.sin(0.05*x)*Math.cos(0.05*z)/0.05;
  // return 5*Math.sin(z/10) +5*Math.cos(-x/10);
  // return Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
  // return Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
  // return (Math.pow(Math.abs(x),0.5))*Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
}
function generateMap(){
  var limit = 10;
  for(var z=0; z<limit;z++){
    if(!map[z]){
      map[z] = [];
    }
    for(var x=0;x<limit;x++){
      map[z][x] = getHight(x - 10,z - 10);
    }
  }
}
var geometry = new THREE.BufferGeometry();
var pA = new THREE.Vector3();
var pB = new THREE.Vector3();
var pC = new THREE.Vector3();
var cb = new THREE.Vector3();
var ab = new THREE.Vector3();
var positions = [];
var normals = [];
var colors = [];
var color = new THREE.Color();
var n = 800, n2 = n / 2;	// triangles spread in the cube
var d = 12, d2 = d / 2;
// generateMap();
function createTriangle(vector1, vector2, vector3){
      var x = Math.random() * n - n2;
      var y = Math.random() * n - n2;
      var z = Math.random() * n - n2;
			positions.push( vector1.x, vector1.y, vector1.z );
			positions.push( vector2.x, vector2.y, vector2.z );
			positions.push( vector3.x, vector3.y, vector3.z );
			// flat face normals
			pA = vector1.clone();
			pB = vector2.clone();
			pC = vector3.clone();
			cb.subVectors( pC, pB );
			ab.subVectors( pA, pB );
			cb.cross( ab );
			cb.normalize();
			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;
			normals.push( nx * 32767, ny * 32767, nz * 32767 );
			normals.push( nx * 32767, ny * 32767, nz * 32767 );
			normals.push( nx * 32767, ny * 32767, nz * 32767 );
			// colors
			var vx = ( x / n ) + 0.5;
			var vy = ( y / n ) + 0.5;
			var vz = ( z / n ) + 0.5;
			color.setRGB( vx, vy, vz );
			colors.push( color.r * 255, color.g * 255, color.b * 255 );
			colors.push( color.r * 255, color.g * 255, color.b * 255 );
      colors.push( color.r * 255, color.g * 255, color.b * 255 );
}

function cleanTriangles(){
  triangles.forEach(function(triangle){
    scene.remove(triangle);
  });
  triangles = [];
}
function getRenderFromPosition(){
    var radio = 300;
    var startX = camera.position.x - radio;
    var endX = camera.position.x + radio;
    var startZ = camera.position.z - radio;
    var endZ = camera.position.z + radio;
    for(var x=startX; x<endX;x++){
        for(var z=startZ; z<endZ; z++){
          createTriangle(
            new THREE.Vector3( x,  getHight(x,z+1), z+1 ),
            new THREE.Vector3( x+1, getHight(x+1,z), z),
            new THREE.Vector3( x, getHight(x,z), z )
          );
          createTriangle(
            new THREE.Vector3( x,  getHight(x,z+1), z+1),
            new THREE.Vector3( x+1, getHight(x+1,z+1), z+1),
            new THREE.Vector3( x+1, getHight(x+1,z), z)
          );
        }
    }
    var positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
    var normalAttribute = new THREE.Int16BufferAttribute( normals, 3 );
    var colorAttribute = new THREE.Uint8BufferAttribute( colors, 3 );
    normalAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader
    colorAttribute.normalized = true;
    geometry.addAttribute( 'position', positionAttribute );
    geometry.addAttribute( 'normal', normalAttribute );
    geometry.addAttribute( 'color', colorAttribute );
    geometry.computeBoundingSphere();
    var material = new THREE.MeshPhongMaterial( {
      color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
      side: THREE.DoubleSide, vertexColors: THREE.VertexColors
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
}
getRenderFromPosition();

var time = 0;
var backposition = new THREE.Vector3(0,0,0);
function animate() {
  time++;
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
