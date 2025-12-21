const canvas = document.getElementById('stars');
if (!canvas) {
    // Exit gracefully if canvas doesn't exist on this page
    console.log('Stars canvas not found - skipping animation');
} else {
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];
let powerStars = [];
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    }
    update() {
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        if (this.opacity >= 1 || this.opacity <= 0.2) {
            this.twinkleDirection *= -1;
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        // Simplified drawing without gradient for better performance
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.opacity = 1;
        this.angle = Math.PI / 4;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.01;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        // Simplified shooting star without gradient for better performance
        ctx.strokeStyle = '#ffdf00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.angle) * this.length,
            this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();
        ctx.restore();
    }
    isOffScreen() {
        return this.x > canvas.width || this.y > canvas.height || this.opacity <= 0;
    }
}
class PowerStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 30 + 40;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.03 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.05;
        this.floatOffset = 0;
        this.floatSpeed = Math.random() * 0.02 + 0.01;
        this.opacity = Math.random() * 0.3 + 0.4;
        this.image = new Image();
        this.image.src = 'https://media.tenor.com/80x8KB3gJvEAAAAj/sm64-mario.gif';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
    update() {
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;
        this.floatOffset = Math.sin(this.pulsePhase) * 10;
    }
    draw() {
        if (!this.imageLoaded) return;
        ctx.save();
        ctx.translate(this.x, this.y + this.floatOffset);
        ctx.rotate(this.rotation);
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        const size = this.size * pulse;
        // Simplified glow effect for better performance
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = 'rgba(255, 223, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
        ctx.restore();
    }
}
// Reduced star count for better performance
for (let i = 0; i < 100; i++) {
    stars.push(new Star());
}
for (let i = 0; i < 3; i++) {
    powerStars.push(new PowerStar());
}
setInterval(() => {
    if (Math.random() > 0.8) { // Reduced shooting star frequency
        shootingStars.push(new ShootingStar());
    }
}, 3000);
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    shootingStars = shootingStars.filter(star => !star.isOffScreen());
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });
    powerStars.forEach(star => {
        star.update();
        star.draw();
    });
    requestAnimationFrame(animate);
}
animate();
// Reduced click effect stars for better performance
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const distance = Math.random() * 50 + 20;
        const newStar = new Star();
        newStar.x = x + Math.cos(angle) * distance;
        newStar.y = y + Math.sin(angle) * distance;
        newStar.size = Math.random() * 3 + 1;
        stars.push(newStar);
        setTimeout(() => {
            const index = stars.indexOf(newStar);
            if (index > -1) stars.splice(index, 1);
        }, 2000);
    }
});
}
