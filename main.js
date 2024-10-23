import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 7;
camera.position.y = 5;
camera.lookAt(0, 5, 0);

const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const css3DRenderer = new CSS3DRenderer();
css3DRenderer.setSize(window.innerWidth, window.innerHeight);
css3DRenderer.domElement.style.position = "absolute";
css3DRenderer.domElement.style.top = "0";
css3DRenderer.domElement.style.left = "0";
document.body.appendChild(css3DRenderer.domElement);

const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);

const gltfLoader = new GLTFLoader();
let model;
gltfLoader.load(
  "./2.glb",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);

    const rightMonitorScreen = model.getObjectByName("RightMonitor_Screen_0");
    const leftMonitorScreen = model.getObjectByName("LeftMonitor_Screen_0");

    // Right Monitor Screen Texture
    if (rightMonitorScreen) {
      const textureLoader = new THREE.TextureLoader();
      const screenTexture = textureLoader.load('./IMG_0489.JPG');
      screenTexture.minFilter = THREE.LinearMipMapLinearFilter;
      screenTexture.magFilter = THREE.LinearFilter;
      screenTexture.wrapS = THREE.RepeatWrapping;
      screenTexture.wrapT = THREE.RepeatWrapping;
      screenTexture.repeat.set(1, 1);
      screenTexture.rotation = Math.PI / 2;
      const screenMaterial = new THREE.MeshBasicMaterial({
        map: screenTexture
      });
      rightMonitorScreen.material = screenMaterial;
    }

    // Left Monitor Screen CSS3DRenderer
    if (leftMonitorScreen) {
      const monitorWorldPosition = new THREE.Vector3();
      leftMonitorScreen.getWorldPosition(monitorWorldPosition);
      console.log(monitorWorldPosition);
      const element = document.createElement("div");
      element.id = "cssProjector"; 
      element.style.width = "50px";
      element.style.height = "50px";
      element.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      element.style.display = "flex";
      element.style.justifyContent = "center";
      element.style.alignItems = "center";
      element.innerHTML = "<h2>Your Content Here</h2>";

      const cssObject = new CSS3DObject(element);
      cssObject.position.copy(monitorWorldPosition);

      const monitorWorldQuaternion = new THREE.Quaternion();
      leftMonitorScreen.getWorldQuaternion(monitorWorldQuaternion);
      const monitorWorldRotation = new THREE.Euler().setFromQuaternion(monitorWorldQuaternion);
      cssObject.rotation.copy(monitorWorldRotation);

      cssObject.scale.set(0.5, 0.5, 0.5); // Adjust the scale if needed
      scene.add(cssObject);
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 2);
scene.add(hemiLight);

const controls = new OrbitControls(camera, css3DRenderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;


// camera.target.set(0,0,0);
// controls.update();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  css3DRenderer.render(scene, camera);
  controls.update();
}

animate();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  css3DRenderer.setSize(window.innerWidth, window.innerHeight);
});
