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
camera.position.set(50,3,50);
// camera.position.z = 50;
// camera.position.y = 3;
// camera.position.x = 50;
var controls = new THREE.OrbitControls( camera );
controls.update();
var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 3, 3, 5);

scene.add( light );
var light2 = new THREE.AmbientLight( 0xabababa, 0.3 );
scene.add( light2 );



var triangles = [];
var map = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,4,4,4,0,0],
  [0,0,0,4,5,4,0,0],
  [0,0,0,4,4,4,0,0],
  [0,0,3,0,0,0,0,0],
  [0,0,0,0,0,0,-1,0],
  [0,0,0,0,0,0,0,0]
];

function getHight(x,z){
  console.log(':',x,z);
  // var arg = (Math.pow(x,2)+Math.pow(z,2),0.5);
  // return Math.pow(arg)*Math.sin(arg)/arg;
  return Math.sin(0.05*x)*Math.cos(0.05*z)/0.05;
  // return 5*Math.sin(z/10) +5*Math.cos(-x/10);
}
function generateMap(){
  var limit = 150;
  for(var z=0; z<limit;z++){
    if(!map[z]){
      map[z] = [];
    }
    for(var x=0;x<limit;x++){
      map[z][x] = getHight(x - 10,z - 10);
    }
  }
}
generateMap();
function createTriangle(vector1, vector2, vector3){
  console.log(vector1,vector2,vector3);
  var triangleGeometry = new THREE.Geometry();

  triangleGeometry.vertices.push(
  	vector1,
    vector2,
    vector3
  );
  var triangle = new THREE.Triangle(
    vector1,
    vector2,
    vector3
  );
  var normal = triangle.getNormal();
  triangleGeometry.faces.push( new THREE.Face3( 0, 1, 2 , normal) );
  triangleGeometry.dynamic = true;
  triangleGeometry.verticesNeedUpdate = true;
  triangleGeometry.elementsNeedUpdate = true;
  triangleGeometry.computeBoundingSphere();
  var triangle = new THREE.Mesh( triangleGeometry, material );
  scene.add( triangle );
  triangles.push(triangle);
}
for(var reverseZ=1; reverseZ < map.length; reverseZ++){
  var z = map.length - reverseZ - 1;
  for(var x=0; x<map[reverseZ].length - 1;x++){
      // createTriangle(z+1,)
      // console.log(z+1,x);
      // console.log(z,x);
      // console.log(z,x+1);
      createTriangle(
        new THREE.Vector3( x,  map[z+1][x], z+1 ),
      	new THREE.Vector3( x+1, map[z][x+1], z),
      	new THREE.Vector3( x, map[z][x], z )
      );
      console.log(z+1,x);
      console.log(z,x+1);
      console.log(z+1,x+1);
      createTriangle(
        new THREE.Vector3( x,  map[z+1][x], z+1),
        new THREE.Vector3( x+1, map[z+1][x+1], z+1),
        new THREE.Vector3( x+1, map[z][x+1], z)
      );
  }
}

var time = 0;
function animate() {
  time++;
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
