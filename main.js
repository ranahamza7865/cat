// ==============
// FELINE WEBSITE
// Main JavaScript
// ==============

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==============
    // GLOBAL VARIABLES
    // ==============
    let scene, camera, renderer, catGeometry, catMaterial;
    let heroScene, heroCamera, heroRenderer;
    let interactiveScene, interactiveCamera, interactiveRenderer;
    let whistle, tail, ears;
    let isAnimating = false;
    const cat = {
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        blinkTimer: 0,
        lastBlink: 0,
        headTurn: 0
    };

    // ==============
    // PRELOADER
    // ==============
    const preloader = document.getElementById('preloader');
    const loaderFill = document.querySelector('.loader-fill');

    function loadPreloader() {
        loaderFill.style.width = '100%';

        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';

            // Animations are initialized once at DOMContentLoaded; do not initialize again here.
        }, 2000);
    }

    // ==============
    // CURSOR EFFECTS
    // ==============
    const cursor = document.querySelector('.cursor');
    const cursorTrail = document.querySelector('.cursor-trail');

    function initCursor() {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            cursor.style.transform = `translate3d(${x - 10}px, ${y - 10}px, 0)`;
            cursorTrail.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0)`;
        });

        // Hover effects on buttons and links
        document.querySelectorAll('button, a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.borderColor = 'var(--color-gold)';
                cursorTrail.style.opacity = '0.5';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.borderColor = 'var(--color-gold)';
                cursorTrail.style.opacity = '0';
            });
        });
    }

    // ==============
    // HERO SECTION - 3D CAT AND ENVIRONMENT
    // ==============
    function initHeroScene() {
        const canvas = document.getElementById('hero-canvas');

        // Scene setup
        heroScene = new THREE.Scene();

        // Camera
        const aspect = canvas.clientWidth / canvas.clientHeight;
        heroCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        heroCamera.position.set(0, 0, 10);

        // Renderer
        heroRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        heroRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        heroRenderer.shadowMap.enabled = true;
        heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting - Cinematic golden hour lighting
        const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
        heroScene.add(ambientLight);

        // Main light - Golden sunlight
        const directionalLight = new THREE.DirectionalLight(0xFFD700, 2);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.set(1024, 1024);
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        heroScene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xFFF8DC, 0.5);
        fillLight.position.set(-10, 5, 10);
        heroScene.add(fillLight);

        // Create Persian cat model
        createPersianCat();

        // Ambient particles
        createHeroParticles();

        // Handle resize
        window.addEventListener('resize', () => {
            const aspect = canvas.clientWidth / canvas.clientHeight;
            heroCamera.aspect = aspect;
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        // Mouse parallax effect
        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (e.clientX - centerX) / 1000;
            const moveY = (e.clientY - centerY) / 1000;

            heroCamera.position.x = moveX * 0.5;
            heroCamera.position.y = moveY * 0.5;
        });
    }

    function createPersianCat() {
        // Main cat body - simplified realistic model
        const catGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 24);
        bodyGeometry.scale(0.8, 0.6, 1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.95
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        catGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.45, 32, 32);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.3, 0);
        head.castShadow = true;
        catGroup.add(head);

        // Ears (pair)
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
            roughness: 0.3
        });

        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.2, 0.6, 0.1);
        leftEar.rotation.set(0, Math.PI / 6, 0);
        catGroup.add(leftEar);

        const rightEar = leftEar.clone();
        rightEar.position.set(0.2, 0.6, 0.1);
        catGroup.add(rightEar);

        // Eyes - large and realistic
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0x4A90E2,
            transparent: true,
            opacity: 0.95
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 0.35, 0.3);
        catGroup.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.set(0.1, 0.35, 0.3);
        catGroup.add(rightEye);

        // Pupils
        const pupilGeometry = new THREE.CircleGeometry(0.03, 16);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.1, 0.35, 0.33);
        catGroup.add(leftPupil);

        const rightPupil = leftPupil.clone();
        rightPupil.position.set(0.1, 0.35, 0.33);
        catGroup.add(rightPupil);

        // Whiskers
        const whiskerGeometry = new THREE.BufferGeometry();
        const whiskerMaterial = new THREE.LineBasicMaterial({
            color: 0x333333,
            linewidth: 2
        });

        // Left whiskers
        const leftWhisker1 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.45, 0.32, 0.05),
                new THREE.Vector3(-0.75, 0.32, 0.08)
            ]),
            whiskerMaterial
        );

        const leftWhisker2 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.45, 0.35, 0),
                new THREE.Vector3(-0.75, 0.35, 0)
            ]),
            whiskerMaterial
        );

        const leftWhisker3 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.45, 0.38, -0.05),
                new THREE.Vector3(-0.75, 0.38, -0.08)
            ]),
            whiskerMaterial
        );

        const rightWhisker1 = leftWhisker1.clone();
        rightWhisker1.position.x = 0.9;
        rightWhisker1.material.color.set(0x333333);

        const rightWhisker2 = leftWhisker2.clone();
        rightWhisker2.position.x = 0.9;

        const rightWhisker3 = leftWhisker3.clone();
        rightWhisker3.position.x = 0.9;

        catGroup.add(leftWhisker1, leftWhisker2, leftWhisker3);
        catGroup.add(rightWhisker1, rightWhisker2, rightWhisker3);

        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.03, 0.05, 4);
        const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xDB7093 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.4, 0.2);
        nose.rotation.x = Math.PI;
        catGroup.add(nose);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5, 8);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5F5DC,
            roughness: 0.3
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0, -1.5);
        tail.rotation.set(0, Math.PI, 0);
        tail.rotation.z = -0.3;
        catGroup.add(tail);

        // Store for animation
        whistle = tail;
        tailRef = tail;

        // Position cat in center
        catGroup.position.set(0, 0, 0);
        catGroup.scale.set(1, 1, 1);

        heroScene.add(catGroup);
        catRef = catGroup;
    }

    let tailRef = null;
    let catRef = null;

    function createHeroParticles() {
        const particles = document.getElementById('particles-container');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const delay = Math.random() * 5;

            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.opacity = Math.random() * 0.5 + 0.2;

            particles.appendChild(particle);
        }
    }

    // ==============
    // HERO ANIMATION LOOP
    // ==============
    let heroClock = new THREE.Clock();

    function animateHero() {
        if (!heroRenderer) return;

        requestAnimationFrame(animateHero);

        const elapsed = heroClock.getElapsedTime();

        // Subtle breathing animation
        const breathScale = 1 + Math.sin(elapsed * 0.5) * 0.01;
        if (catRef) {
            catRef.scale.set(breathScale, breathScale, breathScale);

            // Subtle head movement
            catRef.rotation.y = Math.sin(elapsed * 0.3) * 0.05;

            // Gentle tail sway
            if (tailRef) {
                tailRef.rotation.z = Math.sin(elapsed * 1.2) * 0.1;
            }
        }

        heroRenderer.render(heroScene, heroCamera);
    }

    // ==============
    // INTERACTIVE SECTION - FULL 3D CAT
    // ==============
    function initInteractiveScene() {
        const canvas = document.getElementById('interactive-canvas');

        interactiveScene = new THREE.Scene();
        interactiveScene.background = new THREE.Color(0x0a0a0a);

        const aspect = canvas.clientWidth / canvas.clientHeight;
        interactiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        interactiveCamera.position.set(0, 0, 5);

        interactiveRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        interactiveRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        interactiveRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        interactiveRenderer.shadowMap.enabled = true;
        interactiveRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
        interactiveScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFD700, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        interactiveScene.add(directionalLight);

        // Create detailed cat model
        createInteractiveCat();

        // Add floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.1,
            transparent: true,
            opacity: 0.3
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        interactiveScene.add(floor);

        // Add sparkles
        createSparkles();

        window.addEventListener('resize', () => {
            const aspect = canvas.clientWidth / canvas.clientHeight;
            interactiveCamera.aspect = aspect;
            interactiveCamera.updateProjectionMatrix();
            interactiveRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        // Mouse tracking for cat interaction
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Click interaction
        document.getElementById('interactive-canvas').addEventListener('click', () => {
            if (catRef) {
                gsap.to(catRef.scale, {
                    x: 1.1, y: 1.1, z: 1.1,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });

                // Cat reaction
                if (tailRef) {
                    gsap.to(tailRef.rotation, {
                        z: '+=0.8',
                        duration: 0.5,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        });
    }

    function createInteractiveCat() {
        const catGroup = new THREE.Group();

        // Use a more detailed silhouette
        const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E0D6,
            roughness: 0.4,
            metalness: 0.05
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        catGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.5, 0);
        head.castShadow = true;
        catGroup.add(head);

        // Ears with hair detail
        const earGeometry = new THREE.ConeGeometry(0.12, 0.35, 6);

        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(-0.18, 0.75, 0.08);
        leftEar.rotation.set(0, 0, Math.PI / 8);
        catGroup.add(leftEar);

        const rightEar = leftEar.clone();
        rightEar.position.x = 0.18;
        catGroup.add(rightEar);

        // Eyes - with pupils
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A90E2,
            roughness: 0.1
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 0.55, 0.25);
        catGroup.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.x = 0.12;
        catGroup.add(rightEye);

        // Pupils - we'll animate these
        const pupilGeometry = new THREE.CircleGeometry(0.025, 16);
        const pupilMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true
        });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.12, 0.55, 0.28);
        catGroup.add(leftPupil);

        const rightPupil = leftPupil.clone();
        rightPupil.position.x = 0.12;
        catGroup.add(rightPupil);

        // Whiskers
        const whiskerMat = new THREE.LineBasicMaterial({
            color: 0x555555,
            linewidth: 1.5
        });

        const whiskerPositions = [
            [-0.32, 0.52, 0.03, -0.6, 0.52, 0.05],
            [-0.32, 0.54, 0, -0.6, 0.54, 0],
            [-0.32, 0.56, -0.03, -0.6, 0.56, -0.05],
            [0.32, 0.52, 0.03, 0.6, 0.52, 0.05],
            [0.32, 0.54, 0, 0.6, 0.54, 0],
            [0.32, 0.56, -0.03, 0.6, 0.56, -0.05]
        ];

        whiskerPositions.forEach(pos => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(pos[0], pos[1], pos[2]),
                new THREE.Vector3(pos[3], pos[4], pos[5])
            ]);
            const line = new THREE.Line(geometry, whiskerMat);
            catGroup.add(line);
        });

        // Nose
        const noseGeometry = new THREE.ConeGeometry(0.025, 0.035, 4);
        const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xD58C9C });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.48, 0.28);
        nose.rotation.x = Math.PI;
        catGroup.add(nose);

        // Tail
        const tailGeometry = new THREE.TorusGeometry(0.08, 0.15, 8, 16);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0xE8E0D6,
            roughness: 0.4
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.3, -1.4);
        tail.rotation.set(0, Math.PI, 0);
        tail.rotation.z = -0.4;
        catGroup.add(tail);

        // Store for animation
        tailRef = tail;
        interactiveCat = catGroup;
        interactiveCat = catGroup;

        interactiveScene.add(catGroup);
        catRef = catGroup;
    }

    let interactiveCat = null;
    let interactiveClock = new THREE.Clock();
    let blinkEnabled = true;
    let lastBlinkTime = 0;

    function createSparkles() {
        const sparkles = [];
        for (let i = 0; i < 20; i++) {
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3
            }));
            sprite.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 20
            );
            sprite.scale.set(0.1, 0.1, 1);
            interactiveScene.add(sprite);
            sparkles.push(sprite);
        }
    }

    function animateInteractive() {
        if (!interactiveRenderer || !interactiveCat) return;

        requestAnimationFrame(animateInteractive);

        const elapsed = interactiveClock.getElapsedTime();

        // Blinking
        if (blinkEnabled && elapsed - lastBlinkTime > Math.random() * 3 + 2) {
            blinkCat();
            lastBlinkTime = elapsed;
        }

        // Tail animation
        tailRef.rotation.z = Math.sin(elapsed * 3) * 0.15 + Math.sin(elapsed * 1.5) * 0.05;

        // Subtle breathing
        const breathScale = 1 + Math.sin(elapsed * 2) * 0.005;
        interactiveCat.scale.set(breathScale, breathScale, breathScale);

        // Mouse tracking for eye movement
        if (interactiveCat) {
            const head = interactiveCat.children[1]; // Head is second child

            // Calculate target pupil positions based on mouse
            const targetLeftPupilX = -0.12 + mouseX * 0.05;
            const targetRightPupilX = 0.12 + mouseX * 0.05;

            // Animate pupils
            const children = interactiveCat.children;
            for (let i = 3; i < children.length; i += 6) {
                if (children[i + 5]) { // Pupils are at specific indices
                    children[i + 5].position.x += (targetLeftPupilX - children[i + 5].position.x) * 0.1;
                }
            }

            // Head turn based on mouse
            interactiveCat.rotation.y = mouseX * 0.2;
        }

        interactiveRenderer.render(interactiveScene, interactiveCamera);
    }

    let mouseX = 0, mouseY = 0;

    function blinkCat() {
        if (!interactiveCat) return;

        // Quick scale down for blinking effect
        gsap.to(interactiveCat.scale, {
            y: 0.1,
            duration: 0.05,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                // Close eyes (scale y down)
                gsap.set(interactiveCat.scale, { y: 0.3 });
            }
        });

        // Tail reacts
        gsap.to(tailRef.rotation, {
            z: '+=0.3',
            duration: 0.1,
            yoyo: true
        });
    }

    // ==============
    // GSAP ANIMATIONS
    // ==============
    function initAnimations() {
        // Initialize cursor
        initCursor();

        // Register the GSAP plugins loaded in index.html.
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // Preloader animation
        loadPreloader();

        // Initialize scenes
        initHeroScene();
        initInteractiveScene();

        // Hero section animations
        gsap.from('.title-line', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });

        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.4
        });

        gsap.from('.btn-explore', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.6
        });

        gsap.from('.scroll-indicator', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.8
        });

        // Collection section animations
        gsap.from('.section-header', {
            opacity: 0,
            y: 50,
            scrollTrigger: {
                trigger: '#collection-section',
                start: 'top 80%',
                end: 'top 60%',
                scrub: true
            }
        });

        gsap.from('.section-title', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.from('.section-subtitle', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2
        });

        // Breed cards
        gsap.utils.toArray('.breed-card').forEach((card, i) => {
            gsap.from(card, {
                opacity: 0,
                y: 50,
                rotationX: 30,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 60%',
                    scrub: true
                },
                delay: i * 0.1
            });

            // Hover interaction
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    rotationY: 5,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Interactive section
        gsap.from('.interactive-container', {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#interactive-section',
                start: 'top 80%',
                end: 'top 60%',
                scrub: true
            }
        });

        // Gallery section
        gsap.from('.gallery-item', {
            opacity: 0,
            y: 100,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#gallery-section',
                start: 'top 80%',
                end: 'top 60%',
                scrub: true
            },
            stagger: 0.1
        });

        // Final section
        gsap.from('.final-title', {
            opacity: 0,
            y: 100,
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: '#final-section',
                start: 'top 80%',
                end: 'top 70%',
                scrub: true
            }
        });

        gsap.from('.btn-final-explore', {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            delay: 0.5,
            scrollTrigger: {
                trigger: '#final-section',
                start: 'top 75%',
                end: 'top 65%',
                scrub: true
            }
        });

        // Section transitions
        gsap.utils.toArray('section').forEach(section => {
            if (section.id !== 'hero-section') {
                const header = section.querySelector('.section-header');
                if (header) {
                    gsap.from(header, {
                        opacity: 0,
                        y: 30,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            end: 'top 60%',
                            toggleActions: 'play none none reverse'
                        }
                    });
                }
            }
        });

        // Button interactions
        document.getElementById('explore-btn').addEventListener('click', () => {
            gsap.to(window, {
                scrollTo: '#collection-section',
                duration: 2,
                ease: 'power3.inOut'
            });
        });

        document.getElementById('final-explore-btn').addEventListener('click', () => {
            gsap.fromTo('.gallery-item', {
                opacity: 0,
                y: 100
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '#gallery-section',
                    start: 'top 80%',
                    end: 'top 60%'
                }
            });
            gsap.to(window, {
                scrollTo: '#gallery-section',
                duration: 1.5,
                ease: 'power3.inOut'
            });
        });

        // Smooth scroll indicators
        window.addEventListener('scroll', () => {
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (window.scrollY > 100) {
                scrollIndicator.classList.add('visible');
            } else {
                scrollIndicator.classList.remove('visible');
            }
        });

        // Start render loops
        animateHero();
        animateInteractive();
    }

    // ==============
    // INITIALIZE ON LOADING
    // ==============
    initAnimations();
});

// Images already use the browser's native loading="lazy" attribute in index.html.
// No additional lazy-loading script is needed.

// ==============
// MOBILE TOUCH INTERACTIONS
// ==============
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');

    // Simplify 3D for mobile
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
        document.querySelectorAll('.breed-card').forEach(card => {
            card.style.transformStyle = 'flat';
        });
    }
}