import * as THREE from 'three';

// Wooden hangers fitted to each Hunyuan garment (public/models_hunyuan/*.glb).
// Every coordinate is garment-local: model centred at the origin, height 1, Y up, front +Z.
// `peak` is where the hook leaves the hanger; `left`/`right` run from the peak out to the
// shoulder tips and sit just under the inside of each shoulder. `rail` is the rail centre the
// hook wraps over; optional `shaft` points bend the hook stem through a collar or hood.
// Fits were solved and verified in Blender against each mesh (clearance >= 4 mm from the
// fabric, no part of the bar/arms outside the garment); refit if a GLB changes.
export const HANGER_FITS = {
  // hoodie: arms sit in the shoulder cavities; the hook rises through the hood lining (opening cut in the GLB) and out of the hood
  w01: { radius: .019, bar: false, peak: [0, .246, .012], rail: [0, .565, .04],
    shaft: [[0, .3, .03]],
    left: [[-.04, .288, -.0289], [-.08, .336, -.0212], [-.12, .368, -.0186], [-.16, .37, -.0207], [-.2, .37, -.0149]],
    right: [[.04, .292, -.0245], [.08, .31, -.0198], [.12, .37, -.0178], [.16, .37, -.022], [.2, .37, -.0137]] },
  // long sleeve tee
  w02: { radius: .019, bar: true, peak: [0, .404, -.0266], rail: [0, .554, -.0266],
    left: [[-.04, .404, -.0268], [-.08, .404, -.0323], [-.12, .404, -.0447], [-.16, .404, -.0554], [-.2, .404, -.0541], [-.24, .404, -.0464], [-.28, .386, -.0375]],
    right: [[.04, .404, -.0304], [.08, .404, -.04], [.12, .404, -.0516], [.16, .404, -.0508], [.2, .4, -.0418], [.24, .372, -.0315], [.28, .35, -.0254]] },
  // boxy tee
  w03: { radius: .019, bar: true, peak: [0, .42, -.0197], rail: [0, .57, -.0197],
    left: [[-.04, .42, -.0255], [-.08, .42, -.0397], [-.12, .42, -.0457], [-.16, .42, -.0397], [-.2, .42, -.0277], [-.24, .416, -.0233], [-.28, .384, -.0226], [-.29, .368, -.0232]],
    right: [[.04, .418, -.0195], [.08, .418, -.0246], [.12, .418, -.0386], [.16, .418, -.0449], [.2, .418, -.0396], [.24, .398, -.0278], [.28, .386, -.0246], [.29, .38, -.0246]] },
  // worn pose with crossed arms: shoulders sit behind the body centre, no crossbar
  w04: { radius: .019, bar: false, peak: [0, .454, -.0932], rail: [0, .604, -.0932],
    left: [[-.04, .454, -.0934], [-.08, .454, -.1028], [-.12, .448, -.1148], [-.16, .432, -.1096], [-.2, .42, -.094], [-.24, .406, -.0749], [-.26, .4, -.066]],
    right: [[.04, .454, -.0969], [.08, .452, -.1065], [.12, .442, -.1138], [.16, .424, -.1062], [.2, .406, -.0894], [.24, .392, -.0739], [.26, .382, -.0641]] },
};

const HOOK = [[-.065, 0], [-.015, .043], [.026, .04], [.034, 0], [.012, -.036], [-.018, -.037]];

// Generic fit for models without a solved entry (e.g. the models/ fallback set).
export function autoHangerFit(shoulderY, halfWidth) {
  return { radius: .019, bar: true, peak: [0, shoulderY + .14, 0], rail: [0, shoulderY + .29, 0],
    left: [[-halfWidth, shoulderY, 0]], right: [[halfWidth, shoulderY, 0]] };
}

export function hangerPolyline(fit) {
  return [...fit.left.slice().reverse(), fit.peak, ...fit.right].map(p => new THREE.Vector3(...p));
}

// The hook curls in the Y/Z plane so it wraps over the rail (which runs along X).
export function hookCurve(fit) {
  const [rx, ry, rz] = fit.rail;
  return new THREE.CatmullRomCurve3([new THREE.Vector3(...fit.peak),
    ...(fit.shaft || []).map(p => new THREE.Vector3(...p)),
    ...HOOK.map(([y, z]) => new THREE.Vector3(rx, ry + y, rz + z))]);
}

export function createHanger(fit, { wood, metal }) {
  const group = new THREE.Group();
  const add = (geometry, material, position, quaternion) => {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.copy(position);
    if (quaternion) mesh.quaternion.copy(quaternion);
    mesh.castShadow = true; group.add(mesh); return mesh;
  };
  const rod = (a, b, radius) => {
    const direction = new THREE.Vector3().subVectors(b, a);
    add(new THREE.CylinderGeometry(radius, radius, direction.length(), 16), wood,
      a.clone().add(b).multiplyScalar(.5),
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()));
  };
  const points = hangerPolyline(fit);
  for (let i = 0; i < points.length - 1; i++) rod(points[i], points[i + 1], fit.radius);
  for (const p of points) add(new THREE.SphereGeometry(fit.radius, 16, 8), wood, p);
  if (fit.bar) rod(points[0], points[points.length - 1], .011);
  add(new THREE.TubeGeometry(hookCurve(fit), 32, .009, 8, false), metal);
  return group;
}
