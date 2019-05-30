function CustomControls(camera) {
  this.camera = camera;
  this.direction = new THREE.Vector3(0,0,0);
  this.currentKeys = [];
  this.addListeners();
}

CustomControls.prototype.addListeners = function() {
  var self = this;
  document.addEventListener('keypress', function(event) {
    var key = String.fromCharCode(event.keyCode);
    if (!self.currentKeys.includes(key.toLowerCase())) {
      self.currentKeys.push(key.toLowerCase());
    }
    switch (key) {
      case 'w':
        self.direction = new THREE.Vector3(0,0,-1);
        break;
      case 's':
        self.direction = new THREE.Vector3(0,0,1);
        break;
      case 'd':
        self.direction = new THREE.Vector3(1,0,0);
        break;
      case 'a':
        self.direction = new THREE.Vector3(-1,0,0);
        break;
      default:
    }
    console.log('key: ', key);
  });
  document.addEventListener('keyup', function(event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();
    console.log('key-up: ', key);
    if (self.currentKeys.includes(key) || self.currentKeys.includes(key.toUpperCase())) {
      self.direction = new THREE.Vector3(0,0,0);
    }
  });
}

CustomControls.prototype.update = function() {
    if(this.currentKeys.length){
      camera.position.add(this.direction);
    }
}
