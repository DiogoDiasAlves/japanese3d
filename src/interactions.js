/**
 * interactions.js
 * Clean, flicker-free raycasting hover + click handler.
 *
 * Key design decisions:
 *  1. Update() called from animate() — never from mousemove — keeps raycasting
 *     frame-synced and avoids redundant work.
 *  2. currentHovered is compared by REFERENCE — no duplicate state changes.
 *  3. Materials cloned at init time so highlights are instance-isolated.
 *  4. GSAP `overwrite: true` prevents tween stacking.
 */
import * as THREE from 'three';
import gsap from 'gsap';

const raycaster = new THREE.Raycaster();
raycaster.firstHitOnly = true;

const mouse = new THREE.Vector2(-999, -999); // off-screen default
let currentHovered = null;

const tooltip = document.getElementById('tooltip');

// ─── Init — call once after the main model is in the scene ───────────────────
export function initInteractions(camera, model) {
    // Build flat mesh list — clone materials once here
    const meshList = [];
    model.traverse((node) => {
        if (!node.isMesh) return;
        node.material = node.material.clone();
        if (!node.material.emissive) {
            node.material.emissive = new THREE.Color(0x000000);
        }
        node._baseEmissive = node.material.emissive.clone();
        node._baseEmissiveIntensity = node.material.emissiveIntensity ?? 0;
        meshList.push(node);
    });

    // Mouse tracking — ONLY updates coordinates, never raycasts
    window.addEventListener('pointermove', (e) => {
        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        window._lastPointer = e;
    });

    // Reset on pointer leave
    window.addEventListener('pointerleave', () => {
        mouse.set(-999, -999);
    });

    // ─── Per-frame updater (return for use in main animate loop) ──────────────
    return function updateInteractions() {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(meshList, false);
        const hit  = hits.length > 0 ? hits[0].object : null;

        if (hit === currentHovered) return; // no state change — do nothing

        // Leave old
        if (currentHovered) {
            _unhighlight(currentHovered);
            document.body.style.cursor = 'default';
        }

        // Enter new
        if (hit) {
            _highlight(hit);
            _showTooltip(hit.name || 'Scene Object');
            document.body.style.cursor = 'pointer';
        } else {
            _hideTooltip();
        }

        currentHovered = hit;
    };
}

// ─── Highlight helpers ────────────────────────────────────────────────────────
function _highlight(mesh) {
    gsap.to(mesh.material.emissive, {
        r: 0.25, g: 0.18, b: 0.06,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: true,
    });
    gsap.to(mesh.material, {
        emissiveIntensity: 1.0,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: true,
    });
}

function _unhighlight(mesh) {
    const b = mesh._baseEmissive;
    if (!b) return;
    gsap.to(mesh.material.emissive, {
        r: b.r, g: b.g, b: b.b,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true,
    });
    gsap.to(mesh.material, {
        emissiveIntensity: mesh._baseEmissiveIntensity,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true,
    });
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function _showTooltip(label) {
    if (!tooltip) return;
    tooltip.textContent = label;
    tooltip.classList.add('visible');
    _moveTooltip();
}

function _hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('visible');
}

function _moveTooltip() {
    const e = window._lastPointer;
    if (!e || !tooltip) return;
    tooltip.style.left = `${e.clientX + 16}px`;
    tooltip.style.top  = `${e.clientY - 34}px`;
}
