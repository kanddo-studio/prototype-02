# **prototype-02**  

An **isometric grid-based prototype** built using **Phaser 3** and **TypeScript**. This project serves as a foundation for developing isometric games with keyboard and mouse-based movement, pathfinding, and camera tracking.

## **1. Technologies Used**  

### **1.1 Core Technologies**  
- **Phaser 3** – Game engine for 2D games  
- **TypeScript** – Type-safe JavaScript for better maintainability  

### **1.2 Key Features**  
- **Isometric grid system**: 96x48 tile grid with 64px tiles  
- **Player movement**:  
  - Arrow keys for immediate movement (300ms/tile)  
  - Mouse clicks with A* pathfinding (150ms/tile)  
- **Pathfinding**: A* algorithm with Manhattan distance heuristic  
- **Obstacles**: Randomly generated (20% chance per tile)  
- **Camera system**: Smooth player-following camera with bounds  
- **Visual feedback**: Tile hover and path highlighting  
- **Smooth animations**: Tween-based movement with Sine.easeInOut easing  

## **2. Project Structure**  

```plaintext
/src
  ├── assets/             # Game assets (if added: sprites, etc.)
  ├── scenes/             # Game scenes
  │   └── MainScene.ts    # Main isometric game scene
  ├── main.ts             # Game entry point (assumed)
  ├── game.ts             # Phaser game setup (assumed)
```

*Note: This structure assumes a basic setup. Adjust based on your full project.*

## **3. Development**  

### **3.1 Install Dependencies**  
Using **npm** (recommended):  
```sh
npm install
```

### **3.2 Compile TypeScript**  
Ensure a `tsconfig.json` is configured, then run:  
```sh
tsc
```

### **3.3 Start the Game**  
Serve the game using a local server (e.g., `live-server`):  
```sh
npm install -g live-server
live-server
```
Open `http://localhost:8080` in your browser.

*Note: If using a bundler like Vite, replace with appropriate commands (e.g., `npm run dev`).*

## **4. Controls**  
- **Arrow Keys**: Move the player in isometric directions  
  - Left: (-1, 1)  
  - Right: (1, -1)  
  - Up: (-1, -1)  
  - Down: (1, 1)  
- **Mouse Click**: Calculate and follow a path to the clicked tile  
- **ESC**: Cancel current movement  

## **5. Build & Distribution**  
### **5.1 Build for Web**  
If using a bundler, compile the project:  
```sh
npm run build
```
This generates a distributable web version.

*Note: Add specific build commands if using Vite or another tool.*

## **6. Future Improvements**  
- Add player sprites and animations  
- Optimize pathfinding for larger grids with object pooling  
- Implement diagonal movement support  
- Introduce UI for error feedback and game status  
- Check out the previous iteration: [prototype-01](https://github.com/link-to-prototype-01)  

## **7. License**  
This project is licensed under the **MIT License**.  