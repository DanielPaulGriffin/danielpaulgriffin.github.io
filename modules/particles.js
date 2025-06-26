import { camera, transform } from './camera.js';
import { lineColor } from './colors.js';
export const particles = [];

export function createParticles() {
    // This is just a placeholder - particles are created elsewhere
}

export function updateParticles(particles) {
    particles.forEach((p, i) => {
        // Update particle
        p.x -= Math.sin(p.angle) * p.speed;
        p.y += Math.cos(p.angle) * p.speed; // <-- change + to -
        p.life--;

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    });
}

// Remove transform usage from particle drawing
export function drawParticles(particles, ctx) {
    for (const p of particles) {
        const screenPos = transform(p.x, p.y);
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.scale(camera.scale, camera.scale); // ← apply zoom
        ctx.globalAlpha = 1;
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export function createCollisionParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 4 + 2,
            angle: Math.random() * Math.PI * 2,
            life: 30
        });
    }
}
