/**
 * TouchControls.js - Comprehensive touch control system for TRAP game
 * 
 * Features:
 * 1. Virtual joystick (bottom-left) - movement
 * 2. Touch to interact - tap NPCs, items
 * 3. Touch-friendly buttons (minimum 60x60px)
 * 4. Settings/menu button (tap to open)
 * 5. Close buttons on all UI panels
 * 6. Pinch-to-zoom for map
 * 7. Touch scroll for inventory lists
 * 
 * Usage:
 * import TouchControls from './TouchControls.js';
 * 
 * In scene create():
 * this.touchControls = new TouchControls(this);
 * this.touchControls.setupJoystick();
 * this.touchControls.setupMenuButton();
 * 
 * In scene update():
 * const movement = this.touchControls.getMovement();
 */

import { CONFIG } from './config.js';

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;
        
        // Configuration
        this.joystickConfig = {
            baseRadius: 50,       // 100px diameter (50px radius)
            knobRadius: 25,       // 50px diameter (25px radius)
            maxDistance: 40,      // Max distance knob can move from center
            xPercent: 0.12,       // 12% from left
            yPercent: 0.78        // 22% from bottom (78% from top)
        };
        
        this.buttonConfig = {
            minSize: 70,          // Minimum 70x70 for touch-friendly
            interactX: 0.88,     // 88% from left
            interactY: 0.80,     // 20% from bottom
            menuX: 0.95,         // 95% from left (top right)
            menuY: 0.12          // 12% from top
        };
        
        // State
        this.joystick = null;
        this.joystickKnob = null;
        this.joystickBase = null;
        this.joystickActive = false;
        this.joystickPointer = null;
        this.joystickVector = { x: 0, y: 0 };
        
        this.interactButton = null;
        this.interactLabel = null;
        
        this.menuButton = null;
        this.menuLabel = null;
        
        // Pinch-to-zoom state
        this.pinchStartDistance = 0;
        this.pinchStartZoom = 1;
        this.isPinching = false;
        
        // Touch scroll state
        this.scrollableContainers = [];
        this.activeScroll = null;
        this.scrollVelocity = 0;
        this.isScrolling = false;
        this.lastScrollY = 0;
        
        // Detect touch device
        this.isTouchDevice = this.detectTouchDevice();
    }
    
    /**
     * Detect if running on touch device
     */
    detectTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    /**
     * Setup virtual joystick for movement (bottom-left)
     */
    setupJoystick() {
        const { width, height } = this.scene.scale;
        
        const x = width * this.joystickConfig.xPercent;
        const y = height * this.joystickConfig.yPercent;
        
        // Create joystick base (larger for touch)
        this.joystickBase = this.scene.add.circle(
            x, y, 
            this.joystickConfig.baseRadius, 
            0x444444, 
            0.6
        );
        this.joystickBase.setDepth(1000);
        this.joystickBase.setScrollFactor(0);
        
        // Create joystick knob
        this.joystickKnob = this.scene.add.circle(
            x, y, 
            this.joystickConfig.knobRadius, 
            0x00ff00, 
            0.9
        );
        this.joystickKnob.setDepth(1001);
        this.joystickKnob.setScrollFactor(0);
        
        // Setup input handlers
        this.setupJoystickInput();
        
        return this.joystickBase;
    }
    
    /**
     * Setup joystick touch/mouse input
     */
    setupJoystickInput() {
        const joystickZone = {
            x: this.joystickConfig.xPercent - 0.2,  // Left 20% of screen
            y: this.joystickConfig.yPercent - 0.15, // Bottom 30% of screen
            width: 0.35,
            height: 0.35
        };
        
        // Pointer down - start joystick
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.isInJoystickZone(pointer)) {
                this.joystickActive = true;
                this.joystickPointer = pointer;
                this.updateJoystick(pointer);
            }
        });
        
        // Pointer move - update joystick position
        this.scene.input.on('pointermove', (pointer) => {
            if (this.joystickActive && this.joystickPointer && 
                pointer.id === this.joystickPointer.id) {
                this.updateJoystick(pointer);
            }
        });
        
        // Pointer up - reset joystick
        this.scene.input.on('pointerup', (pointer) => {
            if (this.joystickActive && this.joystickPointer && 
                pointer.id === this.joystickPointer.id) {
                this.resetJoystick();
            }
        });
        
        // Handle pointer cancel
        this.scene.input.on('pointerupoutside', (pointer) => {
            if (this.joystickActive && this.joystickPointer && 
                pointer.id === this.joystickPointer.id) {
                this.resetJoystick();
            }
        });
    }
    
    /**
     * Check if pointer is in joystick zone (left side of screen)
     */
    isInJoystickZone(pointer) {
        const { width, height } = this.scene.scale;
        
        // Left 35% of screen for joystick area
        return pointer.x < width * 0.35 && 
               pointer.y > height * 0.50; // Bottom half of screen
    }
    
    /**
     * Update joystick position based on pointer
     */
    updateJoystick(pointer) {
        if (!this.joystickBase || !this.joystickKnob) return;
        
        const baseX = this.joystickBase.x;
        const baseY = this.joystickBase.y;
        
        const dx = pointer.x - baseX;
        const dy = pointer.y - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.joystickConfig.maxDistance;
        
        // Clamp distance
        const clampedDistance = Math.min(distance, maxDist);
        const angle = Math.atan2(dy, dx);
        
        // Move knob
        const knobX = baseX + Math.cos(angle) * clampedDistance;
        const knobY = baseY + Math.sin(angle) * clampedDistance;
        
        this.joystickKnob.setPosition(knobX, knobY);
        
        // Calculate vector (-1 to 1)
        this.joystickVector.x = (clampedDistance / maxDist) * Math.cos(angle);
        this.joystickVector.y = (clampedDistance / maxDist) * Math.sin(angle);
    }
    
    /**
     * Reset joystick to center
     */
    resetJoystick() {
        if (!this.joystickBase || !this.joystickKnob) return;
        
        this.joystickKnob.setPosition(this.joystickBase.x, this.joystickBase.y);
        this.joystickVector = { x: 0, y: 0 };
        this.joystickActive = false;
        this.joystickPointer = null;
    }
    
    /**
     * Get current joystick movement vector
     */
    getMovement() {
        return {
            x: this.joystickVector.x,
            y: this.joystickVector.y
        };
    }
    
    /**
     * Get vector for PlayerController compatibility
     * Returns { x, y } in range -1 to 1
     */
    getVector() {
        return this.getMovement();
    }
    
    /**
     * Setup interact button (E key) - touch-friendly
     */
    setupInteractButton(callback) {
        const { width, height } = this.scene.scale;
        
        const x = width * this.buttonConfig.interactX;
        const y = height * this.buttonConfig.interactY;
        
        // Create button (minimum 70x70 for touch)
        this.interactButton = this.scene.add.rectangle(
            x, y, 
            this.buttonConfig.minSize, 
            this.buttonConfig.minSize, 
            0x44aa44, 
            0.8
        );
        this.interactButton.setDepth(1000);
        this.interactButton.setScrollFactor(0);
        this.interactButton.setInteractive({ 
            useHandCursor: true,
            hitArea: new Phaser.Geom.Circle(35, 35, 40)  // Larger hit area
        });
        
        // Add "E" label
        this.interactLabel = this.scene.add.text(x, y, 'E', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
        
        // Touch feedback
        this.interactButton.on('pointerdown', () => {
            this.interactButton.setScale(0.95);
            this.interactButton.setAlpha(1);
            if (callback) callback();
        });
        
        this.interactButton.on('pointerup', () => {
            this.interactButton.setScale(1);
            this.interactButton.setAlpha(0.8);
        });
        
        this.interactButton.on('pointerout', () => {
            this.interactButton.setScale(1);
            this.interactButton.setAlpha(0.8);
        });
        
        return this.interactButton;
    }
    
    /**
     * Setup menu/settings button (top-right)
     */
    setupMenuButton(callback) {
        const { width, height } = this.scene.scale;
        
        const x = width * this.buttonConfig.menuX;
        const y = height * this.buttonConfig.menuY;
        
        // Create button (minimum 70x70 for touch)
        this.menuButton = this.scene.add.rectangle(
            x, y, 
            this.buttonConfig.minSize, 
            this.buttonConfig.minSize, 
            0x4444aa, 
            0.8
        );
        this.menuButton.setDepth(1000);
        this.menuButton.setScrollFactor(0);
        this.menuButton.setInteractive({ useHandCursor: true });
        
        // Add gear/menu icon
        this.menuLabel = this.scene.add.text(x, y, '☰', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
        
        // Touch feedback
        this.menuButton.on('pointerdown', () => {
            this.menuButton.setScale(0.95);
            this.menuButton.setAlpha(1);
        });
        
        this.menuButton.on('pointerup', () => {
            this.menuButton.setScale(1);
            this.menuButton.setAlpha(0.8);
            if (callback) callback();
        });
        
        this.menuButton.on('pointerout', () => {
            this.menuButton.setScale(1);
            this.menuButton.setAlpha(0.8);
        });
        
        return this.menuButton;
    }
    
    /**
     * Setup pinch-to-zoom for camera/map
     * Call this in scene's create() after camera is set up
     */
    setupPinchToZoom() {
        // Track two-finger touches
        this.scene.input.on('pointerdown', (pointer) => {
            // Start pinch if we have 2+ pointers
            const activePointers = this.scene.input.pointers;
            const pointerCount = activePointers.filter(p => p.isDown).length;
            
            if (pointerCount >= 2) {
                this.startPinch(activePointers);
            }
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isPinching) {
                this.updatePinch(pointer);
            }
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            const activePointers = this.scene.input.pointers;
            const pointerCount = activePointers.filter(p => p.isDown).length;
            
            if (pointerCount < 2) {
                this.endPinch();
            }
        });
    }
    
    /**
     * Start pinch gesture
     */
    startPinch(pointers) {
        if (pointers.length < 2) return;
        
        const p1 = pointers[0];
        const p2 = pointers[1];
        
        if (!p1.isDown || !p2.isDown) return;
        
        this.isPinching = true;
        this.pinchStartDistance = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + 
            Math.pow(p2.y - p1.y, 2)
        );
        
        if (this.scene.cameras && this.scene.cameras.main) {
            this.pinchStartZoom = this.scene.cameras.main.zoom;
        }
    }
    
    /**
     * Update pinch gesture - adjust zoom
     */
    updatePinch(pointer) {
        if (!this.isPinching || !this.scene.cameras) return;
        
        const activePointers = this.scene.input.pointers.filter(p => p.isDown);
        if (activePointers.length < 2) return;
        
        const p1 = activePointers[0];
        const p2 = activePointers[1];
        
        const currentDistance = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + 
            Math.pow(p2.y - p1.y, 2)
        );
        
        // Calculate zoom factor
        const zoomFactor = currentDistance / this.pinchStartDistance;
        let newZoom = this.pinchStartZoom * zoomFactor;
        
        // Clamp zoom (0.5x to 3x)
        newZoom = Math.max(0.5, Math.min(3, newZoom));
        
        // Apply to camera
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.setZoom(newZoom);
        }
    }
    
    /**
     * End pinch gesture
     */
    endPinch() {
        this.isPinching = false;
        this.pinchStartDistance = 0;
        this.pinchStartZoom = 1;
    }
    
    /**
     * Make a container scrollable with touch
     * @param {Phaser.GameObjects.Container} container - The container to make scrollable
     * @param {Object} bounds - { x, y, width, height } in screen coordinates
     */
    makeScrollable(container, bounds) {
        const scrollable = {
            container: container,
            bounds: bounds,
            contentHeight: 0,
            scrollY: 0,
            maxScrollY: 0,
            scrollVelocity: 0,
            isScrolling: false,
            lastPointerY: 0,
            pointerId: null
        };
        
        // Create scroll indicator (optional visual feedback)
        scrollable.scrollBar = this.createScrollBar(bounds);
        
        this.scrollableContainers.push(scrollable);
        
        // Setup touch input for this container
        this.setupScrollInput(scrollable);
        
        return scrollable;
    }
    
    /**
     * Create visual scroll bar indicator
     */
    createScrollBar(bounds) {
        const { width, height } = this.scene.scale;
        
        // Background track
        const track = this.scene.add.rectangle(
            bounds.x + bounds.width - 15,
            bounds.y + bounds.height / 2,
            8,
            bounds.height,
            0x222222,
            0.5
        );
        track.setScrollFactor(0);
        track.setDepth(1002);
        
        // Thumb indicator
        const thumb = this.scene.add.rectangle(
            bounds.x + bounds.width - 15,
            bounds.y + bounds.height / 2,
            8,
            30,
            0x666666,
            0.8
        );
        thumb.setScrollFactor(0);
        thumb.setDepth(1003);
        
        return { track, thumb, visible: false };
    }
    
    /**
     * Setup touch input for scrolling
     */
    setupScrollInput(scrollable) {
        // Listen for pointer events on the container bounds
        const zone = new Phaser.Geom.Rectangle(
            scrollable.bounds.x,
            scrollable.bounds.y,
            scrollable.bounds.width,
            scrollable.bounds.height
        );
        
        this.scene.input.on('pointerdown', (pointer) => {
            if (Phaser.Geom.Rectangle.Contains(zone, pointer.x, pointer.y)) {
                scrollable.isScrolling = true;
                scrollable.lastPointerY = pointer.y;
                scrollable.pointerId = pointer.id;
            }
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (scrollable.isScrolling && pointer.id === scrollable.pointerId) {
                const deltaY = pointer.y - scrollable.lastPointerY;
                scrollable.scrollY += deltaY;
                scrollable.scrollY = Math.max(0, Math.min(scrollable.scrollY, scrollable.maxScrollY));
                
                // Update container position
                scrollable.container.y = scrollable.scrollY;
                
                // Update scroll bar position
                this.updateScrollBar(scrollable);
                
                scrollable.lastPointerY = pointer.y;
            }
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            if (pointer.id === scrollable.pointerId) {
                scrollable.isScrolling = false;
                scrollable.pointerId = null;
            }
        });
        
        this.scene.input.on('pointerupoutside', (pointer) => {
            if (pointer.id === scrollable.pointerId) {
                scrollable.isScrolling = false;
                scrollable.pointerId = null;
            }
        });
    }
    
    /**
     * Update scroll bar position
     */
    updateScrollBar(scrollable) {
        if (!scrollable.scrollBar) return;
        
        const { thumb } = scrollable.scrollBar;
        
        // Calculate thumb position
        if (scrollable.maxScrollY > 0) {
            const scrollPercent = scrollable.scrollY / scrollable.maxScrollY;
            const trackHeight = scrollable.bounds.height;
            const thumbRange = trackHeight - 30; // Subtract thumb height
            
            thumb.y = scrollable.bounds.y + 15 + (scrollPercent * thumbRange);
            thumb.setAlpha(0.8);
        }
    }
    
    /**
     * Set content height for scroll calculations
     */
    setScrollContentHeight(scrollable, contentHeight) {
        scrollable.contentHeight = contentHeight;
        scrollable.maxScrollY = Math.max(0, contentHeight - scrollable.bounds.height);
        
        // Show/hide scroll bar
        if (scrollable.scrollBar) {
            scrollable.scrollBar.visible = scrollable.maxScrollY > 0;
            scrollable.scrollBar.track.setAlpha(scrollable.maxScrollY > 0 ? 0.5 : 0);
        }
    }
    
    /**
     * Create a touch-friendly button
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @param {number} width - Button width (minimum 60)
     * @param {number} height - Button height (minimum 60)
     * @param {string} text - Button label
     * @param {function} callback - Click/tap callback
     * @param {object} options - Additional options { color, strokeColor }
     */
    createButton(x, y, width, height, text, callback, options = {}) {
        // Enforce minimum touch-friendly size
        const minSize = Math.max(60, Math.min(width, height));
        const buttonWidth = Math.max(60, width);
        const buttonHeight = Math.max(60, height);
        
        const bgColor = options.color || 0x2a2a2a;
        const strokeColor = options.strokeColor || 0xffcc00;
        
        // Container
        const container = this.scene.add.container(x, y);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, bgColor);
        bg.setStrokeStyle(3, strokeColor);
        
        // Label
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: buttonWidth > 150 ? '14px' : '10px',
            color: options.textColor || CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(buttonWidth, buttonHeight);
        container.setScrollFactor(0);
        container.setDepth(1000);
        container.setInteractive({ useHandCursor: true });
        
        // Touch feedback
        container.on('pointerover', () => {
            bg.setFillStyle(0x3a3a3a);
            label.setColor(CONFIG.COLORS.primary);
        });
        
        container.on('pointerout', () => {
            bg.setFillStyle(bgColor);
            label.setColor(options.textColor || CONFIG.COLORS.text);
        });
        
        container.on('pointerdown', () => {
            bg.setFillStyle(0x1a1a1a);
            container.setScale(0.95);
        });
        
        container.on('pointerup', () => {
            bg.setFillStyle(bgColor);
            container.setScale(1);
            if (callback) callback();
        });
        
        return container;
    }
    
    /**
     * Create a close button for UI panels
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @param {function} callback - Close callback
     */
    createCloseButton(x, y, callback) {
        // Close button is 70x70 minimum
        const button = this.createButton(x, y, 70, 70, '✕', callback, {
            color: 0x882222,
            strokeColor: 0xff4444,
            textColor: '#ffffff'
        });
        
        return button;
    }
    
    /**
     * Enable tap-to-interact on game objects
     * Call this in scene's create() to enable tapping NPCs, items, etc.
     */
    enableTapToInteract(callback) {
        // Use existing pointerdown handler from GameScene
        // This just ensures the interact button triggers properly
        this.tapCallback = callback;
        
        // Make game objects interactive via tap
        this.scene.input.on('pointerdown', (pointer) => {
            // Don't trigger if in joystick or button areas
            if (this.isInControlArea(pointer)) return;
            
            // Find tappables at this position
            const tappables = this.scene.input.getHitGameObjects(pointer);
            
            if (tappables && tappables.length > 0) {
                // Find first tappable object
                const tappable = tappables.find(obj => obj.getData('tappable'));
                
                if (tappable && this.tapCallback) {
                    this.tapCallback(tappable);
                }
            }
        });
    }
    
    /**
     * Check if pointer is in any control area (joystick, buttons)
     */
    isInControlArea(pointer) {
        const { width, height } = this.scene.scale;
        
        // Check joystick area (left side)
        if (pointer.x < width * 0.35 && pointer.y > height * 0.50) {
            return true;
        }
        
        // Check interact button area
        if (this.interactButton) {
            const btnBounds = this.interactButton.getBounds();
            if (Phaser.Geom.Rectangle.Contains(btnBounds, pointer.x, pointer.y)) {
                return true;
            }
        }
        
        // Check menu button area
        if (this.menuButton) {
            const btnBounds = this.menuButton.getBounds();
            if (Phaser.Geom.Rectangle.Contains(btnBounds, pointer.x, pointer.y)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Show/hide all touch controls
     */
    setVisible(visible) {
        if (this.joystickBase) this.joystickBase.setVisible(visible);
        if (this.joystickKnob) this.joystickKnob.setVisible(visible);
        if (this.interactButton) this.interactButton.setVisible(visible);
        if (this.interactLabel) this.interactLabel.setVisible(visible);
        if (this.menuButton) this.menuButton.setVisible(visible);
        if (this.menuLabel) this.menuLabel.setVisible(visible);
        
        // Hide scroll bars
        this.scrollableContainers.forEach(scrollable => {
            if (scrollable.scrollBar) {
                scrollable.scrollBar.track.setAlpha(0);
                scrollable.scrollBar.thumb.setAlpha(0);
            }
        });
    }
    
    /**
     * Destroy all touch controls
     */
    destroy() {
        if (this.joystickBase) this.joystickBase.destroy();
        if (this.joystickKnob) this.joystickKnob.destroy();
        if (this.interactButton) this.interactButton.destroy();
        if (this.interactLabel) this.interactLabel.destroy();
        if (this.menuButton) this.menuButton.destroy();
        if (this.menuLabel) this.menuLabel.destroy();
        
        // Destroy scroll bars
        this.scrollableContainers.forEach(scrollable => {
            if (scrollable.scrollBar) {
                scrollable.scrollBar.track.destroy();
                scrollable.scrollBar.thumb.destroy();
            }
        });
        
        this.scrollableContainers = [];
    }
}

/**
 * Helper function to add close button to any UI panel
 * Call this after creating a UI panel
 */
export function addCloseButtonToPanel(scene, panel, x, y, closeCallback) {
    const touchControls = new TouchControls(scene);
    const closeBtn = touchControls.createCloseButton(x, y, closeCallback);
    
    // Add to panel if it's a container
    if (panel.add) {
        panel.add(closeBtn);
    }
    
    return closeBtn;
}
