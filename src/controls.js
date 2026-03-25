import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);

    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;

    controls.rotateSpeed     = 0.65;
    controls.zoomSpeed       = 0.8;
    controls.panSpeed        = 0.0;   // Disable pan — keeps diorama centred
    controls.enablePan       = false;

    // Zoom limits for a tight diorama view
    controls.minDistance     = 7;
    controls.maxDistance     = 22;

    // Restrict vertical angle — can't look from below or go overhead
    controls.minPolarAngle   = Math.PI * 0.18;  // ~32°
    controls.maxPolarAngle   = Math.PI * 0.48;  // ~86°

    // Slow cinematic auto-rotation
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.35;

    // Pause auto-rotate while user drags
    canvas.addEventListener('pointerdown', () => { controls.autoRotate = false; });
    canvas.addEventListener('pointerup',   () => { controls.autoRotate = true;  });

    controls.target.set(0, 0.5, 0);
    controls.update();

    return controls;
}
