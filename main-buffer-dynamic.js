var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var cubes = [];
var visualRadio = 100;
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

function getHight(x,z, t){
  var time = t? t: 1;
  // console.log(':',x,z);
  // var arg = (Math.pow(x,2)+Math.pow(z,2),0.5);
  // return Math.pow(arg)*Math.sin(arg)/arg;
  // return Math.sin(0.05*x)*Math.cos(0.05*z)/0.05;
  // return 5*Math.sin(z/10) +5*Math.cos(-x/10);
  // return Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
  return (0.1/(0.1*time))*Math.sin(10*( Math.pow((x)/100,2)+Math.pow((z)/100,2)) )*20;
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
var positionAttribute;
function getRenderFromPosition(){
    var radio = visualRadio;
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
    positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
    var normalAttribute = new THREE.Int16BufferAttribute( normals, 3 );
    var colorAttribute = new THREE.Uint8BufferAttribute( colors, 3 );
    normalAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader
    colorAttribute.normalized = true;
    geometry.addAttribute( 'position', positionAttribute.setDynamic(true));
    geometry.addAttribute( 'normal', normalAttribute.setDynamic(true));
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
function updateNormal(x,z,normalIndex,t){
    var time = t || 1;
    pA.set(x,getHight(x,z+1,time),z+1);
    pB.set(x+1,getHight(x+1,z,time),z);
    pC.set(x,getHight(x,z,time),z);
    cb.subVectors( pC, pB );
    ab.subVectors( pA, pB );
    cb.cross( ab );
    cb.normalize();
    var nx = cb.x;
    var ny = cb.y;
    var nz = cb.z;
    for(var i=0;i<3;i++){
      geometry.attributes.normal.array[normalIndex+(i*3)] = nx * 32767;
      geometry.attributes.normal.array[normalIndex+1+(i*3)] = ny * 32767;
      geometry.attributes.normal.array[normalIndex+2+(i*3)] = nz * 32767;
    }
}
function updateSecondNormal(x,z,normalIndex,t){
    var time = t || 1;
    pA.set(x,getHight(x,z+1,time),z+1);
    pB.set(x+1,getHight(x+1,z+1,time),z+1);
    pC.set(x+1,getHight(x+1,z,time),z);
    cb.subVectors( pC, pB );
    ab.subVectors( pA, pB );
    cb.cross( ab );
    cb.normalize();
    var nx = cb.x;
    var ny = cb.y;
    var nz = cb.z;
    for(var i=0;i<3;i++){
      geometry.attributes.normal.array[normalIndex+(i*3)] = nx * 32767;
      geometry.attributes.normal.array[normalIndex+1+(i*3)] = ny * 32767;
      geometry.attributes.normal.array[normalIndex+2+(i*3)] = nz * 32767;
    }
}
function updateGraph(time){
    var radio = visualRadio;
    var startX = camera.position.x - radio;
    var endX = camera.position.x + radio;
    var startZ = camera.position.z - radio;
    var endZ = camera.position.z + radio;
    var i=0;
    var normalIndex = 0;
    for(var x=startX; x<endX;x++){
        for(var z=startZ; z<endZ; z++){
          geometry.attributes.position.array[i] = x;
          geometry.attributes.position.array[i+1] = getHight(x,z+1,time);
          geometry.attributes.position.array[i+2] = z+1;
          i+=3;
          geometry.attributes.position.array[i] = x+1;
          geometry.attributes.position.array[i+1] = getHight(x+1,z,time);
          geometry.attributes.position.array[i+2] = z;
          i+=3;
          geometry.attributes.position.array[i] = x;
          geometry.attributes.position.array[i+1] = getHight(x,z,time);
          geometry.attributes.position.array[i+2] = z;

          updateNormal(x,z,normalIndex,time);
          normalIndex+=9;
          // createTriangle(
          //   new THREE.Vector3( x,  getHight(x,z+1), z+1 ),
          //   new THREE.Vector3( x+1, getHight(x+1,z), z),
          //   new THREE.Vector3( x, getHight(x,z), z )
          // );
          i+=3;
          geometry.attributes.position.array[i] = x;
          geometry.attributes.position.array[i+1] = getHight(x,z+1,time);
          geometry.attributes.position.array[i+2] = z+1;
          i+=3;
          geometry.attributes.position.array[i] = x+1;
          geometry.attributes.position.array[i+1] = getHight(x+1,z+1,time);
          geometry.attributes.position.array[i+2] = z+1;
          i+=3;
          geometry.attributes.position.array[i] = x+1;
          geometry.attributes.position.array[i+1] = getHight(x+1,z,time);
          geometry.attributes.position.array[i+2] = z;
          i+=3;
          updateSecondNormal(x,z,normalIndex,time);
          normalIndex+=9;
          // createTriangle(
          //   new THREE.Vector3( x,  getHight(x,z+1), z+1),
          //   new THREE.Vector3( x+1, getHight(x+1,z+1), z+1),
          //   new THREE.Vector3( x+1, getHight(x+1,z), z)
          // );
        }
    }
}
var latestPosition = camera.position.clone();
var graphTime = time;
function animate() {
  time++;
  graphTime = Math.sin(time/100)*5 + 5;
  requestAnimationFrame(animate);
  if(time<800){
      updateGraph(graphTime);
  }

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.normal.needsUpdate = true
  if(latestPosition.distanceTo(camera.position) > 100){
    latestPosition = camera.position.clone();
    updateGraph(graphTime);
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.normal.needsUpdate = true
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
