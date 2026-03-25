/**
 * environment.js
 * Builds the compact Japanese-themed stage around the central diorama.
 * Everything here uses procedural geometry — no external model needed.
 * Target footprint: ≈ 30-unit diameter.
 */
import * as THREE from 'three';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
    stone:     0x7b7060,
    stoneDark: 0x4a4538,
    ground:    0x1a1810,
    gravel:    0x3d3830,
    wood:      0x5c3317,
    torii:     0xc0392b,
    cherry:    0xf4a0b5,
    bark:      0x3e2207,
    grass:     0x2d5a1b,
    lantern:   0xffeecc,
};

const mat = (color, rough = 0.85, metal = 0, emissive = null, emI = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = emI; }
    return m;
};

// ─── Main Entry ──────────────────────────────────────────────────────────────
export function buildEnvironment(scene) {
    buildGround(scene);
    buildStonePlatform(scene);
    buildCherryBlossomsRing(scene);
    buildToriiGate(scene, -9.5, 0, 0, Math.PI * 0.5);
    buildToriiGate(scene, 0, 0, -9.5, 0);
    buildStoneLanterns(scene);
    buildPathStones(scene);
}

// ─── Ground disc ──────────────────────────────────────────────────────────────
function buildGround(scene) {
    const geo  = new THREE.CircleGeometry(28, 64);
    const mesh = new THREE.Mesh(geo, mat(C.gravel, 0.95));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.05;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

// ─── Raised stone platform the Tokyo model sits on ───────────────────────────
function buildStonePlatform(scene) {
    // Top face
    const top  = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.35, 32), mat(C.stone, 0.9));
    top.position.y = 0.175;
    top.receiveShadow = true;
    top.castShadow   = true;
    scene.add(top);

    // Rim edge (slightly larger, darker)
    const rim  = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.4, 0.2, 32), mat(C.stoneDark, 0.9));
    rim.position.y = -0.05;
    rim.receiveShadow = true;
    scene.add(rim);
}

// ─── Cherry Blossom Trees ─────────────────────────────────────────────────────
const BLOSSOM_RING = [
    [10, 0, 0], [-10, 0, 0], [0, 0, 10], [0, 0, -10],
    [7.5, 0, 7.5], [-7.5, 0, 7.5], [7.5, 0, -7.5], [-7.5, 0, -7.5],
];

function buildCherryBlossomsRing(scene) {
    BLOSSOM_RING.forEach(([x, , z]) => buildCherryTree(scene, x, z));
}

function buildCherryTree(scene, x, z) {
    const h = 1.8 + Math.random() * 0.8;

    // Trunk
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.16, h, 6),
        mat(C.bark, 0.9)
    );
    trunk.position.set(x, h / 2, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Blossom cluster – 3 overlapping spheres
    const radii = [1.0, 0.85, 0.75];
    const offsets = [[0, 0, 0], [0.4, 0.15, 0.2], [-0.3, 0.2, -0.2]];
    radii.forEach((r, i) => {
        const canopy = new THREE.Mesh(
            new THREE.SphereGeometry(r, 7, 6),
            mat(C.cherry, 0.95)
        );
        canopy.position.set(x + offsets[i][0], h + r * 0.6 + offsets[i][1], z + offsets[i][2]);
        canopy.castShadow = true;
        scene.add(canopy);
    });
}

// ─── Torii Gate ───────────────────────────────────────────────────────────────
function buildToriiGate(scene, x, y, z, rotY) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;
    const M = mat(C.torii, 0.7, 0.05);

    // Two pillars
    [-1, 1].forEach(side => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), M);
        pillar.position.set(side * 0.85, 1.6, 0);
        pillar.castShadow = true;
        group.add(pillar);
    });

    // Top beam (kasagi)
    const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 0.28), M);
    kasagi.position.set(0, 3.25, 0);
    kasagi.castShadow = true;
    group.add(kasagi);

    // Lower beam (nuki)
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.2), M);
    nuki.position.set(0, 2.55, 0);
    nuki.castShadow = true;
    group.add(nuki);

    scene.add(group);
}

// ─── Stone Lanterns ───────────────────────────────────────────────────────────
const LANTERN_SPOTS = [
    [5.5, 0, 5.5], [-5.5, 0, 5.5], [5.5, 0, -5.5], [-5.5, 0, -5.5],
];

function buildStoneLanterns(scene) {
    LANTERN_SPOTS.forEach(([x, , z]) => buildLantern(scene, x, z));
}

function buildLantern(scene, x, z) {
    const base  = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.4), mat(C.stone));
    base.position.set(x, 0.075, z);
    base.castShadow = true;
    scene.add(base);

    const post  = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.65, 6), mat(C.stone));
    post.position.set(x, 0.475, z);
    post.castShadow = true;
    scene.add(post);

    // Glowing paper box
    const box   = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 0.32),
        mat(C.lantern, 0.5, 0, C.lantern, 1.8)   // emissive glow
    );
    box.position.set(x, 0.94, z);
    box.castShadow = false;
    scene.add(box);

    // Roof cap
    const roof  = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.2, 4), mat(C.stone));
    roof.rotation.y = Math.PI / 4;
    roof.position.set(x, 1.18, z);
    scene.add(roof);

    // Lantern point light (low intensity, short range)
    const light = new THREE.PointLight(0xffaa33, 1.2, 4, 2);
    light.position.set(x, 1.0, z);
    scene.add(light);
}

// ─── Stepping stones path ─────────────────────────────────────────────────────
function buildPathStones(scene) {
    // Two short paths leading from 0,0 toward each torii
    const paths = [
        // East: toward x=9.5
        [ [2,0], [3.5,0], [5,0], [6.5,0], [7.8,0] ],
        // North: toward z=-9.5
        [ [0,2], [0,3.5], [0,5], [0,6.5], [0,7.8] ],
    ];
    paths.forEach(steps => {
        steps.forEach(([px, pz]) => {
            const r = 0.2 + Math.random() * 0.08;
            const stone = new THREE.Mesh(
                new THREE.CylinderGeometry(r, r * 1.1, 0.06, 7),
                mat(C.stoneDark, 0.92)
            );
            stone.position.set(px, 0.05, pz);
            stone.rotation.y = Math.random() * Math.PI;
            stone.receiveShadow = true;
            scene.add(stone);
        });
    });
}
