
# LightScreenArt Repository

## Overview
LightScreenArt initially started as a research project aimed at testing the viability of 3D printers for manufacturing household items like picture frames. Over time, the project evolved into a refined process for designing customizable stained glass panels through our web app. This process involved converting custom specifications from SVG documents into STL files for 3D printing, solving a bin-packing problem to fit acrylic panes optimally into a rectangle of a given size for use in a laser cutter, and developing various other supporting components to streamline production and enhance user experience. After refining these processes for a year Ron Seide, Willow Mattison, and I cofounded LightScreenArt: a startup focused on providing a new alternative to custom stained glass.

## Repository Structure

### Main Directory
- **OpenScadScripts/**
  - Contains OpenSCAD modules for generating:
    - **Frames:** Multiple modules to create regular frames, two-piece frames (using screw integration), and n-sided frames from SVG designs.
    - **Screws:** Generates screw slots for objects based on pitch, diameter, and length criteria.
    - **Stained Glass Panels:** Includes multiple versions of panel-generation modules optimized over the course of the project for improved efficiency and accuracy.

- **backend/**
  - Contains code and configuration for the backend server.
    - **main.py:** Flask server to handle user authentication, file manipulation, order and payment processing (Stripe integration), and other services.
    - **requirements.py:** Lists Python dependencies for the backend.
    - **backend.yaml:** Configuration for deploying the backend on Google Cloud Platform (GCP). Old and nonfunctional passwords and keys are given: just replace with yours in order to get it to work.

- **svg-design-demo/**
  - Angular-based web application styled with Bootstrap and integrated with Contentful for headless CMS functionality.

- **svgToSTLScript/**
  - Tools for production team use, including:
    - **Makefiles:** For both Mac and Windows environments.
    - **productionGUI:** A Tkinter-based GUI for retrieving orders from the backend and generating STL files for 3D printing.
	- **svgScaler.ts** An upgraded TypeScript script to scale SVG objects, generate pane files, bin-pack the panes into an optimized rectangle, etc.
	- **svgSTLOpenScad/** Contains updated files from `OpenScadScripts` with additional modules for rail profile generation, optimized for aesthetics and production speed.

## Features

### OpenSCAD Modules
1. **Frame Generator:**
   - Regular frames.
   - Two-piece frames with integrated screw slots.
   - N-sided frames based on SVG rail designs (fun/weird frames).

2. **Screw Generator:**
   - Creates customizable screw slots.

3. **Stained Glass Panels:**
   - Multiple versions of modules for generating glass panels, continuously improved throughout the project.

### Backend Services
- Flask server for:
  - User login and signup.
  - Order and payment processing (via Stripe).
  - File manipulation and data retrieval.
  - Integration with Google Cloud SQL Database.

### Frontend
- **Angular Web App:**
  - Styled with Bootstrap.
  - Integrated with Contentful headless CMS.

### Production Tools
- **svgToSTLScript:**
  - Tools for automating STL file generation from orders.
  - GUI for user-friendly operation.

- **svgScaler.ts:**
  - Scales and bin-packs pane objects to optimize material usage and save production time.

## Deployment

### Backend
1. Configure `backend.yaml` for GCP deployment.
2. Deploy the Flask server on GCP.

### Frontend
1. Navigate to `svg-design-demo/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   ng serve
   ```

### Production Tools
- For GUI:
  1. Navigate to `svgToSTLScript/`.
  2. Run the `productionGUI` script:
     ```bash
     python3 productionGUI.py
     ```
- For `svgScaler.ts`:
  1. Install necessary dependencies:
     ```bash
     npm install
     ```
  2. Run the script after manipulating it for your use case:
     ```bash
     tsc svgScaler.ts
     node svgScaler.js
     ```

## Contact
For questions or support, please contact Logan Richards at [loganrichards.dev@gmail.com].
