# 3D Bistro - Restaurant Experience

A modern, interactive 3D restaurant web application built with Three.js and Vite.

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Visit the URL shown in your terminal (usually `http://localhost:5173`).

## 🛠 Features

- **Realistic 3D Interior:** Floor, walls, and procedural tables.
- **GLB Model Integration:** Premium chairs loaded via GLTFLoader.
- **Interactive UI:** Click on tables to see their number and occupancy status.
- **Smooth Navigation:** OrbitControls with damping for a premium feel.
- **Glassmorphism UI:** Modern HTML/CSS overlay for information display.

## 📁 Project Structure

- `main.js`: Application entry point and animation loop.
- `src/scene.js`: Scene, camera, renderer, and lighting setup.
- `src/restaurant.js`: Build logic for tables, counter, and chairs.
- `src/interactions.js`: Raycasting logic for hover and click events.
- `src/loader.js`: Asset loading handling (GLTF).
- `src/controls.js`: Camera control configuration.

## 🎨 Technologies Used

- [Three.js](https://threejs.org/) - Core 3D engine
- [Vite](https://vitejs.dev/) - Modern frontend build tool
- [Outfit Font](https://fonts.google.com/specimen/Outfit) - Typography
