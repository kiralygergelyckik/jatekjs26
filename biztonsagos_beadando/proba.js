const night = document.querySelector('.night');
const forest = document.querySelector('.forest');
const pupil = document.querySelector('.pupil');
const cursor = document.getElementById('cursor');
const princess = document.getElementById('princess');

if (forest) {
    for (let i = 0; i < 15; i++) {
        const tree = document.createElement('div');
        tree.classList.add('tree');
        const leaves = document.createElement('div');
        leaves.classList.add('leaves');
        const trunk = document.createElement('div');
        trunk.classList.add('trunk');
        tree.appendChild(leaves);
        tree.appendChild(trunk);
        forest.appendChild(tree);
    }
}

document.addEventListener('mousemove', (e) => {
    const eye = document.querySelector('.eye');
    if (eye && pupil) {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = 15;
        pupil.style.transform = `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance}px)`;
    }
    if (cursor) {
        cursor.style.left = `${e.clientX - 4}px`;
        cursor.style.top = `${e.clientY - 4}px`;
    }
});

function togglePrincess() {
    if (!princess) return;
    princess.style.display = Math.random() > 0.7 ? 'block' : 'none';
}
setInterval(togglePrincess, 2000);

let princessX = -100;
function movePrincess() {
    if (princess && princess.style.display === 'block') {
        princessX += 12;
        if (princessX > window.innerWidth + 100) princessX = -100;
        princess.style.left = `${princessX}px`;
    }
    requestAnimationFrame(movePrincess);
}
movePrincess();

function createStar() {
    if (!night) return;
    const star = document.createElement('div');
    star.classList.add('shooting_star');
    const size = 6 + Math.random() * 20;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight / 3);
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    night.appendChild(star);

    const endX = startX + 400 + Math.random() * 200;
    const endY = startY + 100 + Math.random() * 100;
    const dx = endX - startX;
    const dy = endY - startY;
    const duration = 1000 + Math.random() * 8000;
    const startTime = performance.now();

    function animate(time) {
        const progress = (time - startTime) / duration;
        if (progress >= 1) {
            star.remove();
            return;
        }
        star.style.left = `${startX + dx * progress}px`;
        star.style.top = `${startY + dy * progress}px`;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
setInterval(() => {
    if (Math.random() > 0.7) createStar();
}, 600);

function createScanlineNoise() {
    const noise = document.createElement('div');
    noise.className = 'scanline-noise';
    document.body.appendChild(noise);
}
createScanlineNoise();