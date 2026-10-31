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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 40);
  camera.position.set(0, .05, 4.4);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0xa4a6a6, 2.7));
  const key = new THREE.DirectionalLight(0xfff1e3, 3.4);
  key.position.set(-3, 5, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 4, bottom: -3 });
  key.shadow.bias = -.001; key.shadow.normalBias = .015; key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe9ecf1, 1.7); fill.position.set(4, 1, -2); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .12 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.85; floor.receiveShadow = true; scene.add(floor);
  const rack = new THREE.Group(); scene.add(rack);
  const metal = new THREE.MeshStandardMaterial({ color: 0x999b9b, metalness: .7, roughness: .3 });
  function bar(a, b, radius = .012) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 12), metal);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }
  rack.add(bar(new THREE.Vector3(-5, .8, 0), new THREE.Vector3(5, .8, 0), .022));
  for (const x of [-4.2, 4.2]) rack.add(bar(new THREE.Vector3(x, .8, 0), new THREE.Vector3(x, -.85, 0), .022));
  const slots = products.map((p, i) => {
    const root = new THREE.Group(), garment = new THREE.Group(), hanger = new THREE.Group();
    root.position.x = i * 1.05;
    const points = [new THREE.Vector3(0, .63, 0), new THREE.Vector3(-.26, .47, 0), new THREE.Vector3(.26, .47, 0), new THREE.Vector3(0, .63, 0)];
    for (let j = 0; j < 3; j++) hanger.add(bar(points[j], points[j + 1], .008));
    const hook = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .63, 0),new THREE.Vector3(0, .72, 0),new THREE.Vector3(.045, .77, 0),new THREE.Vector3(.04, .82, 0),new THREE.Vector3(-.02, .82, 0),new THREE.Vector3(-.035, .79, 0)]);
    hanger.add(new THREE.Mesh(new THREE.TubeGeometry(hook, 16, .007, 6, false), metal));
    root.add(hanger, garment); scene.add(root);
    return { root, garment, hanger, loaded: false };
  });
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
        const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${products[i].id}.glb`);
        const model = gltf.scene;
        if (disposed) { release(model); continue; }
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
        const scale = 1 / size.y;
        model.scale.setScalar(scale); model.position.copy(center).multiplyScalar(-scale);
        model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        slots[i].garment.add(model); slots[i].loaded = true;
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
    const spacing = camera.aspect < 1 ? .84 : 1.05;
    slots.forEach((slot, i) => {
      const offset = i - index;
      const active = detail && i === index;
      approach(slot.root.position, 'x', detail ? (active ? 0 : Math.sign(offset) * 4) : offset * spacing + dragOffset);
      approach(slot.root.position, 'z', active ? .55 : -Math.abs(offset) * .13);
      approach(slot.garment.position, 'y', active ? .10 : -.03);
      const scale = active ? 1.13 : i === index ? 1 : .88;
      for (const axis of ['x','y','z']) approach(slot.garment.scale, axis, scale);
      approach(slot.garment.rotation, 'y', active ? yaw : 0);
      approach(slot.garment.rotation, 'x', active ? pitch : 0);
      slot.root.rotation.z = !paused && !detail ? Math.sin(time * .0007 + i * 1.7) * .013 : 0;
      slot.hanger.visible = !active;
    });
    approach(camera.position, 'z', detail ? (camera.aspect < 1 ? 3.15 : 3.25) : (camera.aspect < 1 ? 4.5 : 4.1));
    approach(rack.position, 'y', detail ? 2.3 : 0);
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
