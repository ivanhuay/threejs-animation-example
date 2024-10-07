import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderRadio = 200;
scene.background = new THREE.Color( 0x505077 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const material = new THREE.MeshLambertMaterial({
  color: 0x00ff00
});
material.color.convertSRGBToLinear();
camera.position.set(4,30,5);

const light = new THREE.DirectionalLight( 0xffcccc, 0.1 );
light.position.set( 3, 40, 20);

scene.add( light );
var light2 = new THREE.AmbientLight( 0xabababa, 0.8 );
scene.add( light2 );

scene.fog = new THREE.Fog( 0xcccccc, 50, 180 );


// function to get render height for graph points
function getHight(x,z, t){
  // var time = t? t: 1;
  // return Math.sin(0.05*x)*Math.cos(0.05*z)/0.05;
  return 5*Math.sin(z * 0.2 * t/10) +5*Math.cos(-x /10);
  // return Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
  // return (0.1/(0.1*time))* Math.sin(10*( Math.pow((x)/50,2)+Math.pow((z)/50,2)) )*20;
  // return (Math.pow(Math.abs(x),0.5))*Math.sin(10*( Math.pow(x/100,2)+Math.pow(z/100,2)) )*20;
}

const geometry = new THREE.BufferGeometry();
let pA = new THREE.Vector3();
let pB = new THREE.Vector3();
let pC = new THREE.Vector3();
let cb = new THREE.Vector3();
let ab = new THREE.Vector3();
let positions = [];
let normals = [];
let colors = [];
let color = new THREE.Color();
const n = 800, n2 = n / 2;
const d = 12, d2 = d / 2;

function createTriangle(vector1, vector2, vector3){
      const x = Math.random() * n - n2;
      const y = Math.random() * n - n2;
      const z = Math.random() * n - n2;
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

let positionAttribute;

function getRenderFromPosition(){
    const startX = camera.position.x - renderRadio;
    const endX = camera.position.x + renderRadio;
    const startZ = camera.position.z - renderRadio;
    const endZ = camera.position.z + renderRadio;
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
    normalAttribute.normalized = true;
    colorAttribute.normalized = true;
    
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    normalAttribute.setUsage(THREE.DynamicDrawUsage);

    geometry.setAttribute( 'position', positionAttribute);
    geometry.setAttribute( 'normal', normalAttribute);
    geometry.setAttribute( 'color', colorAttribute );
    geometry.computeBoundingSphere();

     const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0xffffff,
        shininess: 250,
        side: THREE.DoubleSide,
        vertexColors: true
    });

    const mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
}
getRenderFromPosition();

let time = 0;
function updateNormal(x,z,normalIndex,t){
    const iTime = t || 1;
    pA.set(x,getHight(x,z+1,iTime),z+1);
    pB.set(x+1,getHight(x+1,z,iTime),z);
    pC.set(x,getHight(x,z,iTime),z);
    cb.subVectors( pC, pB );
    ab.subVectors( pA, pB );
    cb.cross( ab );
    cb.normalize();
    let nx = cb.x;
    let ny = cb.y;
    let nz = cb.z;
    for(var i=0;i<3;i++){
      geometry.attributes.normal.array[normalIndex+(i*3)] = nx * 32767;
      geometry.attributes.normal.array[normalIndex+1+(i*3)] = ny * 32767;
      geometry.attributes.normal.array[normalIndex+2+(i*3)] = nz * 32767;
    }
}
function updateSecondNormal(x,z,normalIndex,t){
    var iTime = t || 1;
    pA.set(x,getHight(x,z+1,iTime),z+1);
    pB.set(x+1,getHight(x+1,z+1,iTime),z+1);
    pC.set(x+1,getHight(x+1,z,iTime),z);
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
    var radio = renderRadio;
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
        }
    }
}

let graphTime = time;
function animate() {
  time++;
  graphTime = Math.sin(time/100)*5 + 5;
  // Move camera in a loop
  camera.position.set(camera.position.x + Math.sin(graphTime / 100) * 10, camera.position.y, camera.position.z)
  
  updateGraph(graphTime);
  geometry.attributes.position.needsUpdate = true
  geometry.attributes.normal.needsUpdate = true
  
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
