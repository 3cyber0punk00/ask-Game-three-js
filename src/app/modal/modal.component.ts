import { Component, OnInit } from '@angular/core';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { SpotLight } from 'three';
// @ts-ignore
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module';
// @ts-ignore
import {GUI} from 'dat.gui';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare var require: any;
declare var $: any;
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {

     // Set our main variables
    // @ts-ignore
    let latestEvent = {};
    let scene =new THREE.Scene(),
      // @ts-ignore
      renderer,
      // @ts-ignore
      camera,
      // @ts-ignore
      model,                              // Our character
      // @ts-ignore
      neck,                               // Reference to the neck bone in the skeleton
      // @ts-ignore
      waist,                               // Reference to the waist bone in the skeleton
      // @ts-ignore
      possibleAnims,                      // Animations found in our file
      // @ts-ignore
      mixer,                              // THREE.js animations mixer
      // @ts-ignore
      idle,                               // Idle, the default state our character returns to
      clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate
      currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
      raycaster = new THREE.Raycaster(),  // Used to detect the click on our character
      loaderAnim = document.getElementById('js-loader');

    getlatestEvent();
    // init();

      function init() {

        const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
        const canvas = document.querySelector('#c');
        const backgroundColor = 0xf1f1f1;

        // Init the scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(backgroundColor);
        scene.fog = new THREE.Fog(backgroundColor, 60, 100);

        // Init the renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // Add a camera
        camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 30
        camera.position.x = 0;
        camera.position.y = -3;

        let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
        stacy_txt.flipY = false;

        const stacy_mtl = new THREE.MeshPhongMaterial({
          map: stacy_txt,
          color: 0xffffff,
          skinning: true
        });


        var loader = new GLTFLoader();

        loader.load(
          MODEL_PATH,
          function(gltf: { scene: any; animations: any; }) {
            model = gltf.scene;
            let fileAnimations = gltf.animations;

            model.traverse((o: { isMesh: any; castShadow: boolean; receiveShadow: boolean; material: any; isBone: any; name: string; }) => {

              if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.material = stacy_mtl;
              }
              // Reference the neck and waist bones
              if (o.isBone && o.name === 'mixamorigNeck') {
                neck = o;
              }
              if (o.isBone && o.name === 'mixamorigSpine') {
                waist = o;
              }
            });

            model.scale.set(7, 7, 7);
            model.position.y = -11;

            scene.add(model);

            // @ts-ignore
            loaderAnim.remove();

            mixer = new THREE.AnimationMixer(model);


            let clips = fileAnimations.filter((val: { name: string; }) => val.name !== 'idle');
            possibleAnims = clips.map((val: { name: any; }) => {
                let clip = THREE.AnimationClip.findByName(clips, val.name);
                clip.tracks.splice(3, 3);
                clip.tracks.splice(9, 3);

                // @ts-ignore
              clip = mixer.clipAction(clip);
                return clip;
              }
            );
            // @ts-ignore
            let idleAnim = THREE.AnimationClip.findByName(fileAnimations, latestEvent.game.eventName);
            idleAnim.tracks.splice(3, 3);
            idleAnim.tracks.splice(9, 3);

            idle = mixer.clipAction(idleAnim);
            idle.play();

          },
          undefined, // We don't need this function
          function(error: any) {
            console.error(error);
          }
        );

        // Add lights
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
        hemiLight.position.set(0, 50, 0);
        // Add hemisphere light to scene
        scene.add(hemiLight);

        let d = 8.25;
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
        dirLight.position.set(-8, 12, 8);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        // Add directional Light to scene
        scene.add(dirLight);


        // Floor
        let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
        let floorMaterial = new THREE.MeshPhongMaterial({
          color: 0xeeeeee,
          shininess: 0,
        });

        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;
        floor.receiveShadow = true;
        floor.position.y = -11;
        scene.add(floor);

        let geometry = new THREE.SphereGeometry(8, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e
        let sphere = new THREE.Mesh(geometry, material);

        sphere.position.z = -15;
        sphere.position.y = -2.5;
        sphere.position.x = -0.25;
        scene.add(sphere);
      }


      function update() {
        // @ts-ignore
        if (mixer) {
          // @ts-ignore
          mixer.update(clock.getDelta());
        }
// @ts-ignore
        if (resizeRendererToDisplaySize(renderer)) {
          // @ts-ignore

          const canvas = renderer.domElement;
          // @ts-ignore
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          // @ts-ignore
          camera.updateProjectionMatrix();
        }
        // @ts-ignore
        renderer.render(scene, camera);
        requestAnimationFrame(update);
      }
    function getlatestEvent() {
      var urlStr = "http://localhost:3000/v1/game/latest/action";

      let headers = {};
      $.ajax({
        url: urlStr,
        type: "GET",
        headers: headers,
        async: false,
        // @ts-ignore
        beforeSend : function(xhr) {
          xhr.setRequestHeader("accept", "application/json");

        },
        // @ts-ignore
        success:function(response) {
          latestEvent = response;
         init();

        },
        // @ts-ignore
        error: function(xhr, status, error) {
          let errorMessage = xhr.status + ': ' + xhr.statusText;
          console.log('Error - ' + errorMessage);
        }
      });

    }

      update();

      function resizeRendererToDisplaySize(renderer: {
              shadowMap?: { enabled: boolean; }; setPixelRatio?: (arg0: number) => void; domElement: any; render?: (arg0: {
                  background: any; fog: any; add: (
                      // @ts-ignore
                      arg0: any) => void; children: any;
              }, arg1: any) => void; setSize?: any;
          }) {
        const canvas = renderer.domElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;

        const needResize =
          canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }

      window.addEventListener('click', e => raycast(e));
      window.addEventListener('touchend', e => raycast(e, true));

      function raycast(e: MouseEvent | TouchEvent, touch = false) {
        var mouse = {};
        if (touch) {
          // @ts-ignore
          mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
          // @ts-ignore
          mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
        } else {
          // @ts-ignore
          mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
          // @ts-ignore
          mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
        }
        // update the picking ray with the camera and mouse position
        // @ts-ignore
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects[0]) {
          var object = intersects[0].object;

          if (object.name === 'stacy') {

            if (!currentlyAnimating) {
              currentlyAnimating = true;
              playOnClick();
            }
          }
        }
      }

      // Get a random animation, and play it
      function playOnClick() {

        // @ts-ignore
        let anim = Math.floor(Math.random() * possibleAnims.length) + 0;

        // @ts-ignore
        playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
        saveEvent(anim);
      }
// Get a random event, and pass to API
    function saveEvent(event:any) {
     let events = [
        {"eventName": "pockets","eventNumber": 0},
        {"eventName": "rope","eventNumber": 1},
        {"eventName": "swingdance","eventNumber": 2},
        {"eventName": "jump","eventNumber": 3},
        {"eventName": "react","eventNumber": 4},
        {"eventName": "shrug","eventNumber": 5},
        {"eventName": "wave","eventNumber": 6},
        {"eventName": "golf","eventNumber": 7},
        {"eventName": "idle","eventNumber": 8},

      ]
      let result = events.filter(item => item.eventNumber === event);
      let data = result[0]
      var urlStr = "http://localhost:3000/v1/game/latest/action";
      let headers = {};
      $.ajax({
        url: urlStr,
        type: "PUT",
        data:data,
        headers: headers,
        async: false,
        // @ts-ignore
        beforeSend : function(xhr) {
          xhr.setRequestHeader("accept", "application/json");

        },
        // @ts-ignore
        success:function(response) {

        },
        // @ts-ignore
        error: function(xhr, status, error) {
          let errorMessage = xhr.status + ': ' + xhr.statusText;
          console.log('Error - ' + errorMessage);
        }
      });

    }


      function playModifierAnimation(from: { play?: () => void; crossFadeTo?: any; enabled?: any; }, fSpeed: number, to: { setLoop: (arg0: any) => void; reset: () => void; play: () => void; crossFadeTo: (arg0: any, arg1: any, arg2: boolean) => void; _clip: { duration: number; }; }, tSpeed: number) {

        to.setLoop(THREE.LoopOnce);
        to.reset();
        to.play();
        from.crossFadeTo(to, fSpeed, true);
        setTimeout(function() {
          from.enabled = true;
          to.crossFadeTo(from, tSpeed, true);
          currentlyAnimating = false;
        }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
      }

      document.addEventListener('mousemove', function(e) {
        var mousecoords = getMousePos(e);
        // @ts-ignore
        if (neck && waist) {
          // @ts-ignore
          moveJoint(mousecoords, neck, 50);
          // @ts-ignore
          moveJoint(mousecoords, waist, 30);
        }
      });

      function getMousePos(e: MouseEvent) {
        return { x: e.clientX, y: e.clientY };
      }

      function moveJoint(mouse: { x: any; y: any; }, joint: { rotation: { y: any; x: any; }; }, degreeLimit: number) {
        let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
        // @ts-ignore
        joint.rotation.y = degrees_to_radians(degrees.x);
        // @ts-ignore
        joint.rotation.x = degrees_to_radians(degrees.y);
      }
    // @ts-ignore
    function degrees_to_radians(degrees)
    {
      var pi = Math.PI;
      return degrees * (pi/180);
    }

      function getMouseDegrees(x: number, y: number, degreeLimit: number) {
        let dx = 0,
          dy = 0,
          xdiff,
          xPercentage,
          ydiff,
          yPercentage;

        let w = { x: window.innerWidth, y: window.innerHeight };

        // Left (Rotates neck left between 0 and -degreeLimit)
        // 1. If cursor is in the left half of screen
        if (x <= w.x / 2) {
          // 2. Get the difference between middle of screen and cursor position
          xdiff = w.x / 2 - x;
          // 3. Find the percentage of that difference (percentage toward edge of screen)
          xPercentage = (xdiff / (w.x / 2)) * 100;
          // 4. Convert that to a percentage of the maximum rotation we allow for the neck
          dx = ((degreeLimit * xPercentage) / 100) * -1;
        }

        // Right (Rotates neck right between 0 and degreeLimit)
        if (x >= w.x / 2) {
          xdiff = x - w.x / 2;
          xPercentage = (xdiff / (w.x / 2)) * 100;
          dx = (degreeLimit * xPercentage) / 100;
        }
        // Up (Rotates neck up between 0 and -degreeLimit)
        if (y <= w.y / 2) {
          ydiff = w.y / 2 - y;
          yPercentage = (ydiff / (w.y / 2)) * 100;
          // Note that I cut degreeLimit in half when she looks up
          dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
        }
        // Down (Rotates neck down between 0 and degreeLimit)
        if (y >= w.y / 2) {
          ydiff = y - w.y / 2;
          yPercentage = (ydiff / (w.y / 2)) * 100;
          dy = (degreeLimit * yPercentage) / 100;
        }
        return { x: dx, y: dy };
      }


  }


}
