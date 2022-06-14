import { ShaderBaseMaterial } from "@/utils/ShaderBaseMaterial/ShaderBaseMaterial";
import type Loaders from "@/webgl/controllers/Loaders/Loaders";
import type Time from "@/webgl/controllers/Time";
import Experience from "@/webgl/Experience";
import {
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  Scene,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  Color,
  Sphere,
  RingBufferGeometry,
  Texture,
  Group,
  sRGBEncoding,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import PhysicCtrl from "../Controllers/Physic/PhysicCtrl";
import SeedGame from "../SeedGame";
import Tree from "../Tree/Tree";
import seedSettings from "./SeedSettings";
import fragment from "./Shaders/fragment.glsl?raw";
import vertex from "./Shaders/vertex.glsl?raw";

export default class Seed {
  private experience: Experience = new Experience();
  private loaders: Loaders = this.experience.loaders as Loaders;
  private camera: PerspectiveCamera = this.experience.world?.homeScene?.camera
    .instance as PerspectiveCamera;
  private game: SeedGame = new SeedGame();
  private physicCtrl: PhysicCtrl | null = null;
  private time: Time = this.experience.time as Time;
  private cameraDirection: Vector3 = new Vector3();
  private scene: Scene | null = null;
  private seeds: Group[] = [];
  private hits: Mesh[] = [];
  private tempSphere = new Sphere();
  private deltaVec = new Vector3();
  private tempVec = new Vector3();
  private forwardVector = new Vector3(0, 0, 1);
  private texture: Texture | null = null;
  private model: GLTF | null = null;
  private material: ShaderBaseMaterial | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.physicCtrl = new PhysicCtrl(scene);
    this.setMaterial();
    this.setModel();
  }
  setMaterial() {
    if (!this.texture)
      this.texture = this.loaders.items["poppingtrees-seed-texture"] as Texture;
    this.texture.flipY = false;
    this.texture.encoding = sRGBEncoding;
    this.material = new ShaderBaseMaterial({
      transparent: false,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });
  }

  setModel() {
    if (!this.model) this.model = this.loaders.items["seed-model"] as GLTF;
    this.model?.scene.traverse((child) => {
      if (child instanceof Mesh && this.texture) {
        if (Array.isArray(child.material)) {
          child.material.map((m) => {
            m = this.material;
          });
        } else {
          child.material = this.material;
        }
      }
    });
    this.model.scene.position.setScalar(0);
  }

  createSeed() {
    if (this.model?.scene) {
      const seedMesh = this.model.scene.clone();
      this.scene?.add(seedMesh);

      const radius = 0.5 * seedSettings.sphereSize;
      // seedMesh.scale.setScalar(radius);
      (seedMesh as any).collider = new Sphere(seedMesh.position, radius);
      (seedMesh as any).velocity = new Vector3(0, 0, 0);
      (seedMesh as any).mass = (Math.pow(radius, 3) * Math.PI * 4) / 3;

      this.seeds.push(seedMesh);
      return seedMesh;
    }
  }

  shot() {
    const seed = this.createSeed();
    this.camera.getWorldDirection(this.cameraDirection);
    seed?.position
      .copy(this.camera.position)
      .addScaledVector(this.cameraDirection, 0.15);
    (seed as any).velocity
      .set(0, 0, 0)
      .addScaledVector(this.cameraDirection, 15)
      .multiplyScalar(0.5);
  }

  updateSphereCollisions(deltaTime: number) {
    for (let i = 0, l = this.seeds.length; i < l; i++) {
      const seed = this.seeds[i];
      const sphereCollider = (seed as any).collider;

      // move the sphere
      (seed as any).velocity.y += seedSettings.gravity * deltaTime;
      sphereCollider.center.addScaledVector((seed as any).velocity, deltaTime);

      // remove the spheres if they've left the world
      if (sphereCollider.center.y < -10) {
        this.seeds.splice(i, 1);
        i--;
        l--;
        // if (Array.isArray(seed.material)) {
        //   seed.material.map((m) => {
        //     m.dispose();
        //   });
        // } else {
        //   seed.material.dispose();
        // }
        // seed.geometry.dispose();
        //FIXME: dispose all
        this.scene?.remove(seed);
        continue;
      }

      // get the sphere position in world space
      this.tempSphere.copy((seed as any).collider);

      let floorCollided = false;
      if (this.physicCtrl?.floorMesh?.geometry.boundsTree)
        this.physicCtrl?.floorMesh?.geometry.boundsTree.shapecast({
          intersectsBounds: (box: any) => {
            return box.intersectsSphere(this.tempSphere);
          },

          intersectsTriangle: (tri: any) => {
            // get delta between closest point and center
            tri.closestPointToPoint(this.tempSphere.center, this.deltaVec);
            this.deltaVec.sub(this.tempSphere.center);
            const distance = this.deltaVec.length();

            // add mesh to test
            if (distance < this.tempSphere.radius) {
              // move the sphere position to be outside the triangle
              const radius = this.tempSphere.radius;
              const depth = distance - radius;
              this.deltaVec.multiplyScalar(1 / distance);
              this.tempSphere.center.addScaledVector(this.deltaVec, depth);

              floorCollided = true;
              if (this.scene) new Tree(this.scene, "small", seed.position);
            }
          },

          traverseBoundsOrder: (box: any) => {
            return (
              box.distanceToPoint(this.tempSphere.center) -
              this.tempSphere.radius
            );
          },
        });
      this.game.lumberjacks.forEach((l) => {
        const collided = l.isInHitBox(seed.position);
        if (collided) {
          console.log(collided);
        }
      });
      if (floorCollided) {
        this.seeds.splice(i, 1);
        i--;
        l--;
        // if (Array.isArray(seed.material)) {
        //   seed.material.map((m) => {
        //     m.dispose();
        //   });
        // } else {
        //   seed.material.dispose();
        // }
        // seed.geometry.dispose();
        //FIXME: dispose all
        this.scene?.remove(seed);
        continue;
      }

      // if (floorCollided) {
      //   // get the delta direction and reflect the velocity across it
      //   this.deltaVec
      //     .subVectors(this.tempSphere.center, sphereCollider.center)
      //     .normalize();
      //   (seed as any).velocity.reflect(this.deltaVec);

      //   // dampen the velocity and apply some drag
      //   const dot = (seed as any).velocity.dot(this.deltaVec);
      //   (seed as any).velocity.addScaledVector(this.deltaVec, -dot * 0.5);
      //   (seed as any).velocity.multiplyScalar(Math.max(1.0 - deltaTime, 0));

      //   // update the sphere collider position
      //   sphereCollider.center.copy(this.tempSphere.center);

      //   // find the point on the surface that was hit
      //   this.tempVec
      //     .copy(this.tempSphere.center)
      //     .addScaledVector(this.deltaVec, -this.tempSphere.radius);
      //   this.onFloorCollide(seed, null, this.tempVec, this.deltaVec, dot, 0.05);
      // }
    }

    // Handle sphere collisions
    // for (let i = 0, l = this.seeds.length; i < l; i++) {
    //   const s1 = this.seeds[i];
    //   const c1 = (s1 as any).collider;
    //   for (let j = i + 1; j < l; j++) {
    //     const s2 = this.seeds[j];
    //     const c2 = (s2 as any).collider;

    //     // If they actually intersected
    //     this.deltaVec.subVectors(c1.center, c2.center);
    //     const depth = this.deltaVec.length() - (c1.radius + c2.radius);
    //     if (depth < 0) {
    //       this.deltaVec.normalize();

    //       // get the magnitude of the velocity in the hit direction
    //       const v1dot = (s1 as any).velocity.dot(this.deltaVec);
    //       const v2dot = (s2 as any).velocity.dot(this.deltaVec);

    //       // distribute how much to offset the spheres based on how
    //       // quickly they were going relative to each other. The ball
    //       // that was moving should move back the most. Add a max value
    //       // to avoid jitter.
    //       const offsetRatio1 = Math.max(v1dot, 0.2);
    //       const offsetRatio2 = Math.max(v2dot, 0.2);

    //       const total = offsetRatio1 + offsetRatio2;
    //       const ratio1 = offsetRatio1 / total;
    //       const ratio2 = offsetRatio2 / total;

    //       // correct the positioning of the spheres
    //       c1.center.addScaledVector(this.deltaVec, -ratio1 * depth);
    //       c2.center.addScaledVector(this.deltaVec, ratio2 * depth);

    //       // Use the momentum formula to adjust velocities
    //       const velocityDifference = new Vector3();
    //       velocityDifference
    //         .addScaledVector(this.deltaVec, -v1dot)
    //         .addScaledVector(this.deltaVec, v2dot);

    //       const velDiff = velocityDifference.length();
    //       const m1 = (s1 as any).mass;
    //       const m2 = (s2 as any).mass;

    //       // Compute new velocities in the moving frame of the sphere that
    //       // moved into the other.
    //       let newVel1, newVel2;
    //       const damping = 0.5;
    //       if (
    //         velocityDifference.dot((s1 as any).velocity) >
    //         velocityDifference.dot((s2 as any).velocity)
    //       ) {
    //         newVel1 = (damping * velDiff * (m1 - m2)) / (m1 + m2);
    //         newVel2 = (damping * velDiff * 2 * m1) / (m1 + m2);

    //         // remove any existing relative velocity from the moving sphere
    //         newVel1 -= velDiff;
    //       } else {
    //         newVel1 = (damping * velDiff * 2 * m2) / (m1 + m2);
    //         newVel2 = (damping * velDiff * (m2 - m1)) / (m1 + m2);

    //         // remove any existing relative velocity from the moving sphere
    //         newVel2 -= velDiff;
    //       }

    //       // Apply new velocities
    //       velocityDifference.normalize();
    //       (s1 as any).velocity.addScaledVector(velocityDifference, newVel1);
    //       (s2 as any).velocity.addScaledVector(velocityDifference, newVel2);

    //       this.tempVec
    //         .copy(c1.center)
    //         .addScaledVector(this.deltaVec, -c1.radius);
    //       this.onFloorCollide(s1, s2, this.tempVec, this.deltaVec, velDiff, 0);
    //     }
    //   }

    //   s1.position.copy(c1.center);
    // }
  }
  onFloorCollide(
    object1: Mesh,
    object2: Mesh | null,
    point: Vector3,
    normal: Vector3,
    velocity: number,
    offset = 0
  ) {
    if (velocity < Math.max(Math.abs(0.04 * seedSettings.gravity), 5)) {
      return;
    }

    // Create an animation when objects collide
    const effectScale =
      Math.max(
        object2
          ? Math.max(
              (object1 as any).collider.radius,
              (object2 as any).collider.radius
            )
          : (object1 as any).collider.radius,
        0.4
      ) * 2.0;
    const plane = new Mesh(
      new RingBufferGeometry(0, 1, 30),
      new MeshBasicMaterial({
        side: 2,
        transparent: true,
        depthWrite: false,
      })
    );
    (plane as any).lifetime = 0;
    (plane as any).maxLifetime = 0.4;
    (plane as any).maxScale =
      effectScale *
      Math.max(Math.sin((Math.min(velocity / 200, 1) * Math.PI) / 2), 0.35);

    plane.position.copy(point).addScaledVector(normal, offset);
    plane.quaternion.setFromUnitVectors(this.forwardVector, normal);
    this.scene?.add(plane);
    this.hits.push(plane);
  }

  update() {
    if (this.physicCtrl && this.physicCtrl.colliders.length > 0) {
      const steps = seedSettings.physicsSteps;
      for (let i = 0; i < steps; i++) {
        this.updateSphereCollisions((this.time.delta * 0.001) / steps);
      }
    }

    // Update collision animations
    for (let i = 0, l = this.hits.length; i < l; i++) {
      const hit = this.hits[i];
      (hit as any).lifetime += this.time.delta;

      const ratio = (hit as any).lifetime / (hit as any).maxLifetime;
      let scale = Math.sin((ratio * 4.5 * Math.PI) / 4);
      scale = 1.0 - Math.pow(1.0 - scale, 2);
      hit.scale.setScalar(scale * (hit as any).maxScale);
      if (Array.isArray(hit.material)) {
        hit.material.map((m) => {
          m.opacity = 1.0 - Math.sin((ratio * 2 * Math.PI) / 4);
        });
      } else {
        hit.material.opacity = 1.0 - Math.sin((ratio * 2 * Math.PI) / 4);
      }

      if (ratio >= 1) {
        this.hits.splice(i, 1);
        (hit as any).parent.remove(hit);
        hit.geometry.dispose();
        if (Array.isArray(hit.material)) {
          hit.material.map((m) => {
            m.dispose();
          });
        } else {
          hit.material.dispose();
        }
        i--;
        l--;
      }
    }
  }
}
