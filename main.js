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
// camera.position.z = 50;
// camera.position.y = 3;
// camera.position.x = 50;
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
  // console.log(':',x,z);
  // var arg = (Math.pow(x,2)+Math.pow(z,2),0.5);
  // return Math.pow(arg)*Math.sin(arg)/arg;
  return Math.sin(0.1*x)*Math.cos(0.1*z)/0.1;
  // return 5*Math.sin(z/10) +5*Math.cos(-x/10);
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
generateMap();
function createTriangle(vector1, vector2, vector3){
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
      var fixedX = x - Math.ceil(map[reverseZ].length/2);
      var fixedZ = z - Math.ceil(map.length/2);
      // createTriangle(
      //   new THREE.Vector3( x,  map[z+1][x], z+1 ),
      // 	new THREE.Vector3( x+1, map[z][x+1], z),
      // 	new THREE.Vector3( x, map[z][x], z )
      // );
      createTriangle(
        new THREE.Vector3( fixedX,  map[z+1][x], fixedZ+1 ),
        new THREE.Vector3( fixedX+1, map[z][x+1], fixedZ),
        new THREE.Vector3( fixedX, map[z][x], fixedZ )
      );
      // console.log(z+1,x);
      // console.log(z,x+1);
      // console.log(z+1,x+1);
      // createTriangle(
      //   new THREE.Vector3( x,  map[z+1][x], z+1),
      //   new THREE.Vector3( x+1, map[z+1][x+1], z+1),
      //   new THREE.Vector3( x+1, map[z][x+1], z)
      // );
      createTriangle(
        new THREE.Vector3( fixedX,  map[z+1][x], fixedZ+1),
        new THREE.Vector3( fixedX+1, map[z+1][x+1], fixedZ+1),
        new THREE.Vector3( fixedX+1, map[z][x+1], fixedZ)
      );
  }
}
function cleanTriangles(){
  triangles.forEach(function(triangle){
    scene.remove(triangle);
  });
  triangles = [];
}
function getRenderFromPosition(){
    var radio = 15;
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
}
var time = 0;
var backposition = new THREE.Vector3(0,0,0);
function animate() {
  time++;
  requestAnimationFrame(animate);
  controls.update();
  var diffX = Math.abs(camera.position.x - backposition.x);
  var diffZ = Math.abs(camera.position.z - backposition.z);
  var samePosition = diffX > 20 && diffZ>20;
  if(!samePosition){
    cleanTriangles();
    getRenderFromPosition();
    console.log('render;', backposition);
    backposition = camera.position.clone();
  }
  // customControls.update();
  renderer.render(scene, camera);
}
animate();
