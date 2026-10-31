import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { products } from './products.js';

export async function createWardrobe(host, { onSelect, onProgress, onError }) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: devicePixelRatio < 2, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 40);
  camera.position.set(0, .05, 4.4);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0xa4a6a6, 2.7));
  // Overhead illumination keeps the shadow on the floor beneath each piece.
  const key = new THREE.DirectionalLight(0xfff1e3, 3.4);
  key.position.set(-.25, 7, 1); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 2, bottom: -2, near: .1, far: 12 });
  key.shadow.bias = -.00015; key.shadow.normalBias = .008; key.shadow.radius = 5; key.shadow.blurSamples = 8;
  key.target.position.set(0, -.2, 0);
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xe9ecf1, 1.7); fill.position.set(4, 1, -2); scene.add(fill);
  const floorY = -.83, railY = .85;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: .16 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = floorY; floor.receiveShadow = true; scene.add(floor);
  const rack = new THREE.Group(); scene.add(rack);
  const metal = new THREE.MeshStandardMaterial({ color: 0xaaa7a0, metalness: .65, roughness: .38 });
  const wood = new THREE.MeshStandardMaterial({ color: 0xa97b50, metalness: .04, roughness: .66 });
  const hookMetal = new THREE.MeshStandardMaterial({ color: 0xb1a18b, metalness: .65, roughness: .42 });
  function bar(a, b, radius = .025, material = metal) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 16), material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    return mesh;
  }
  function cap(x, y, z, radius = .025) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 8), metal);
    mesh.position.set(x, y, z); mesh.castShadow = true; rack.add(mesh);
  }
  const railHalf = 1.91;
  rack.add(bar(new THREE.Vector3(-railHalf, railY, 0), new THREE.Vector3(railHalf, railY, 0)));
  cap(-railHalf, railY, 0); cap(railHalf, railY, 0);
  for (const x of [-1.82, 1.82]) {
    rack.add(bar(new THREE.Vector3(x, railY, 0), new THREE.Vector3(x, floorY + .04, 0)));
    rack.add(bar(new THREE.Vector3(x, floorY + .04, -.34), new THREE.Vector3(x, floorY + .04, .34), .03));
    cap(x, floorY + .04, -.34, .03); cap(x, floorY + .04, .34, .03);
  }
  rack.add(bar(new THREE.Vector3(-1.82, floorY + .12, 0), new THREE.Vector3(1.82, floorY + .12, 0), .02));
  const slots = products.map((p, i) => {
    const root = new THREE.Group(), garment = new THREE.Group(), hanger = new THREE.Group();
    root.position.set((i - 1.5) * .85, railY, 0);
    root.add(hanger, garment); scene.add(root);
    // Seeded variation remains stable across reloads and reduced-motion frames.
    const seed = Math.sin((i + 1) * 127.1) * 43758.5453;
    const random = seed - Math.floor(seed);
    return { root, garment, hanger, loaded: false, yaw: (random * 2 - 1) * Math.PI / 30,
      depth: (random - .5) * .055, phase: i * 1.91, shoulderY: .28 };
  });
  function fitHanger(model, slot) {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const bands = Array.from({ length: 20 }, () => new THREE.Box3());
    const vertex = new THREE.Vector3();
    model.traverse(mesh => {
      if (!mesh.isMesh) return;
      const positions = mesh.geometry.getAttribute('position');
      for (let n = 0; n < positions.count; n++) {
        vertex.fromBufferAttribute(positions, n).applyMatrix4(mesh.matrixWorld);
        const distanceFromTop = (box.max.y - vertex.y) / size.y;
        const band = Math.floor(distanceFromTop * bands.length);
        if (band >= 0 && band < bands.length) bands[band].expandByPoint(vertex);
      }
    });
    // Skip collar/hood tips; find where the upper silhouette opens into shoulders.
    let shoulderBand = 5;
    for (let n = 2; n <= 7; n++) {
      if (!bands[n].isEmpty() && bands[n].max.x - bands[n].min.x >= size.x * .62) { shoulderBand = n; break; }
    }
    const shoulders = bands[shoulderBand];
    const width = shoulders.isEmpty() ? size.x * .65 : shoulders.max.x - shoulders.min.x;
    slot.shoulderY = box.max.y - (shoulderBand + .5) / bands.length * size.y;
    // The shoulder band intersects the wooden arms, rather than hanging below them.
    slot.garment.position.y = -.29 - slot.shoulderY;
    const half = width * .95 / 2;
    const left = new THREE.Vector3(-half, -.29, 0), peak = new THREE.Vector3(0, -.15, 0), right = new THREE.Vector3(half, -.29, 0);
    slot.hanger.add(bar(left, peak, .019, wood), bar(peak, right, .019, wood), bar(left, right, .011, wood));
    // Inner hook curve touches the top of the rail at y = rail radius.
    const hook = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -.15, 0), new THREE.Vector3(0, -.065, 0),
      new THREE.Vector3(.043, -.015, 0), new THREE.Vector3(.04, .026, 0),
      new THREE.Vector3(0, .034, 0), new THREE.Vector3(-.036, .012, 0),
      new THREE.Vector3(-.037, -.018, 0),
    ]);
    const hookMesh = new THREE.Mesh(new THREE.TubeGeometry(hook, 24, .009, 8, false), hookMetal);
    hookMesh.castShadow = true; slot.hanger.add(hookMesh);
    // Rotate about the hook contact, including its depth offset, without breaking contact.
    slot.hanger.rotation.y = slot.yaw;
    slot.garment.rotation.y = slot.yaw;
  }
  let index = 0, detail = false, paused = false, disposed = false, visible = true;
  let yaw = 0, pitch = 0, velocity = 0, pointer = null, dragOffset = 0, frame;
  let completed = 0, failures = 0, lastTime = 0;
  const loader = new GLTFLoader();
  // Two concurrent requests keep initial transfer and decode pressure bounded on phones.
  const queue = products.map((_, i) => i);
  async function worker() {
    while (queue.length && !disposed) {
      const i = queue.shift();
      try {
        const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models_hunyuan/${products[i].id}.glb`)
          .catch(() => loader.loadAsync(`${import.meta.env.BASE_URL}models/${products[i].id}.glb`));
        const model = gltf.scene;
        if (disposed) { release(model); continue; }
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
        const scale = 1 / size.y;
        model.scale.setScalar(scale); model.position.copy(center).multiplyScalar(-scale);
        model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        fitHanger(model, slots[i]); slots[i].garment.add(model); slots[i].loaded = true;
      } catch { failures++; }
      completed++; onProgress(completed, failures); wake();
    }
  }
  worker(); worker();
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); wake();
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); }); intersection.observe(host);
  function wake() { if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw(time) {
    frame = null;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min((time - lastTime) / 1000 || .016, .05); lastTime = time;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blend = reduced ? 1 : 1 - Math.exp(-dt * 9);
    let unsettled = false;
    const approach = (object, key, value) => { const delta = value - object[key]; if (Math.abs(delta) > .0002) unsettled = true; object[key] += delta * blend; };
    if (!pointer && detail && !reduced && !paused) { yaw += velocity * dt * 60; velocity *= Math.pow(.9, dt * 60); }
    if (Math.abs(velocity) > .0001) unsettled = true;
    const rackShift = detail ? 0 : -(index - 1.5) * .12 + dragOffset * .25;
    slots.forEach((slot, i) => {
      const active = detail && i === index;
      const sway = !paused && !reduced && !detail ? Math.sin(time * (.00055 + i * .00006) + slot.phase) * .009 : 0;
      approach(slot.root.position, 'x', detail ? (active ? 0 : (i < index ? -5 : 5)) : (i - 1.5) * .85 + rackShift);
      approach(slot.root.position, 'y', active ? .05 : railY);
      // Keep hooks seated on the rail; garment depth varies below the hook.
      approach(slot.root.position, 'z', active ? .35 : 0);
      approach(slot.root.rotation, 'x', active ? 0 : slot.depth + (i === index ? .09 : 0));
      approach(slot.garment.position, 'y', active ? 0 : -.29 - slot.shoulderY);
      const scale = active ? 1.13 : 1;
      for (const axis of ['x','y','z']) approach(slot.garment.scale, axis, scale);
      approach(slot.garment.rotation, 'y', active ? yaw : slot.yaw);
      approach(slot.garment.rotation, 'x', active ? pitch : 0);
      slot.root.rotation.z = sway;
      slot.hanger.visible = !active;
    });
    // Fit the entire freestanding rack, including its feet, inside every aspect ratio.
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const rackDistance = Math.max(4.4, 2.32 / (Math.tan(halfFov) * camera.aspect));
    approach(camera.position, 'z', detail ? (camera.aspect < 1 ? 3.6 : 3.8) : rackDistance);
    approach(camera.position, 'y', detail ? .28 : 1.55);
    camera.lookAt(0, detail ? 0 : -.02, 0);
    approach(rack.position, 'x', rackShift);
    approach(rack.position, 'y', detail ? 3 : 0);
    rack.traverse(object => { if (object.isMesh) object.castShadow = !detail; });
    renderer.render(scene, camera);
    if ((!paused && !detail) || unsettled) wake();
  }
  const raycaster = new THREE.Raycaster();
  function down(e) {
    if (!e.isPrimary || e.button !== 0) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
    velocity = 0; host.setPointerCapture(e.pointerId); wake();
  }
  function move(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    const dx = e.clientX - pointer.lastX, dy = e.clientY - pointer.lastY;
    pointer.moved ||= Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 7;
    if (detail) { yaw += dx * .012; pitch = THREE.MathUtils.clamp(pitch + dy * .004, -.22, .22); velocity = paused || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : dx * .012; }
    else dragOffset = THREE.MathUtils.clamp((e.clientX - pointer.x) / host.clientWidth * 3, -.9, .9);
    pointer.lastX = e.clientX; pointer.lastY = e.clientY; wake();
  }
  function end(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    const p = pointer; pointer = null; dragOffset = 0;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    if (e.type === 'pointerup') {
      if (!detail && p.moved && Math.abs(e.clientX - p.x) > 35) onSelect(index + (e.clientX < p.x ? 1 : -1), false);
      else if (!detail && !p.moved) {
        const rect = host.getBoundingClientRect();
        raycaster.setFromCamera(new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
        const hits = raycaster.intersectObjects(slots.map(s => s.garment), true);
        if (hits.length) { let object = hits[0].object; while (object.parent && !slots.some(s => s.garment === object)) object = object.parent; const hit = slots.findIndex(s => s.garment === object); if (hit >= 0) onSelect(hit, true); }
      }
    } else velocity = 0;
    wake();
  }
  function blur() { pointer = null; dragOffset = 0; velocity = 0; wake(); }
  const events = { pointerdown: down, pointermove: move, pointerup: end, pointercancel: end, lostpointercapture: end };
  Object.entries(events).forEach(([event, handler]) => host.addEventListener(event, handler));
  function visibility() { if (!document.hidden) { lastTime = 0; wake(); } else blur(); }
  document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur);
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); onError(); });
  function release(root) {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    root.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); Object.values(m).forEach(value => { if (value?.isTexture) textures.add(value); }); } });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
  }
  resize();
  return {
    select(i, open) { if (index !== i || !open) { yaw = 0; pitch = 0; velocity = 0; } index = i; detail = open; wake(); },
    pause(value) { paused = value; if (value) velocity = 0; wake(); },
    rotate(dx, dy = 0) { yaw += dx; pitch = THREE.MathUtils.clamp(pitch + dy, -.22, .22); velocity = 0; wake(); },
    dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); Object.entries(events).forEach(([event, handler]) => host.removeEventListener(event, handler)); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); release(scene); renderer.dispose(); renderer.domElement.remove(); },
  };
}
