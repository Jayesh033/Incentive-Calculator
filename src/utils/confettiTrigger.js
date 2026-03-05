import confetti from 'canvas-confetti';

export function fireConfetti() {
    confetti({
        particleCount: 150,
        spread: 120,
        startVelocity: 40,
        gravity: 0.8,
        ticks: 200,
        origin: { y: 0.7 }
    });
}
