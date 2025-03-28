# **prototype-01**  
<img src="https://github.com/user-attachments/assets/0f54afb5-905b-4030-acb2-299670106e5d" width="420">

A **2D platformer prototype** built using **Phaser**, **TypeScript**, **Electron**, and **Vite**. The project serves as a foundation for developing platformer games with smooth physics, animations, and desktop integration.  

## **1. Technologies Used**  

### **1.1 Core Technologies**  
- **Phaser 3** – Game engine for 2D games  
- **TypeScript** – Type-safe JavaScript for better maintainability  
- **Electron** – Desktop application framework  
- **Vite** – Fast development and build tool  

### **1.2 Key Features**  
- **Platformer mechanics**: movement and jumping  
- **Sprite animations** with frame-based rendering  
- **Physics-based interactions** using Phaser's arcade physics  
- **Desktop & Web support** with Electron and Vite  
- **Game scenes management** using Phaser's Scene API  
- **Optimized FPS control** with a custom `FPSScene` class  

## **2. Project Structure**  

```plaintext
/src
  ├── assets/             # Game assets (sprites, audio, etc.)
  ├── config/             # Configurations (Electron, FPS settings)
  ├── constants/          # Game-related constants
  ├── entities/           # Game objects (Player, Platforms)
  ├── scenes/             # Game scenes (Main scene, FPS controller)
  ├── main.ts             # Game entry point
  ├── game.ts             # Phaser game setup
  ├── electron/           # Electron configuration
```

## **3. Development**  

### **3.1 Install Dependencies**  
Using **Yarn** (recommended):  
```sh
yarn install
```
Or using **npm**:  
```sh
npm install
```

### **3.2 Start the web version (browser)**
```sh
yarn start:dev:web
```
Runs the game in a browser using **Vite**.

### **3.3 Start the desktop version (Electron)**
```sh
yarn start:dev:desktop
```
Runs the game as a **desktop app** with **Electron**.


## **4. Build & Distribution**  

### **4.1 Build for Web**
```sh
yarn build:prod:web
```
Compiles TypeScript and builds the web version.

### **4.2 Build for Windows (Electron)**
```sh
yarn build:prod:windows
```
Generates a `.exe` file for **Windows**.

## **5. Future Improvements**  
Enhancements will be introduced in future prototypes based on this one. Check out the next iteration:
- [prototype-02]()

## **6. License**F  
This project is licensed under the **MIT License**.  
