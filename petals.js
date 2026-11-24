const canvas = document.getElementById('petals-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const totalPetals = 45;
const petals = [];

class Petal {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.scale = Math.random() * 0.35 + 0.25; 
        this.speedY = Math.random() * 1.2 + 0.8;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.2;
        this.opacity = Math.random() * 0.4 + 0.6;
    }

    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y / 35) + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 30) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(this.scale, this.scale);

        const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
        gradient.addColorStop(0, `rgba(255, 215, 225, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(238, 110, 148, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(195, 55, 92, ${this.opacity})`);

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.bezierCurveTo(-15, 15, -22, -5, -12, -20);
        ctx.bezierCurveTo(-5, -28, 5, -28, 12, -20);
        ctx.bezierCurveTo(22, -5, 15, 15, 0, 25);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(180, 40, 75, ${this.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 22);
        ctx.quadraticCurveTo(0, 0, 0, -18);
        ctx.stroke();

        ctx.restore();
    }
}

for (let i = 0; i < totalPetals; i++) {
    petals.push(new Petal());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach((petal) => {
        petal.update();
        petal.draw();
    });
    requestAnimationFrame(animate);
}

animate();