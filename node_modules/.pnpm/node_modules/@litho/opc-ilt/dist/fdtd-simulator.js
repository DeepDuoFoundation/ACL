export class FDTDSimulator {
    useGPU;
    constructor(useGPU = true) {
        this.useGPU = useGPU;
    }
    async simulate(mask) {
        const aerialImage = this.computeAerialImage(mask);
        const resistImage = this.computeResistImage(aerialImage);
        const epe = this.extractEPE(resistImage);
        const cd = this.extractCD(resistImage);
        return { aerialImage, resistImage, epe, cd };
    }
    computeAerialImage(mask) {
        const size = 128;
        return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => {
            let intensity = 0;
            for (const poly of mask.polygons) {
                const dx = (i - poly.x * size / 1000) / size;
                const dy = (j - poly.y * size / 1000) / size;
                intensity += Math.exp(-(dx * dx + dy * dy) * 10);
            }
            return Math.min(intensity, 1.0);
        }));
    }
    computeResistImage(aerialImage) {
        const threshold = 0.3;
        return aerialImage.map((row) => row.map((v) => (v > threshold ? 1.0 : 0.0)));
    }
    extractEPE(resistImage) {
        const epe = [];
        for (let i = 1; i < resistImage.length - 1; i++) {
            const left = resistImage[i][i - 1];
            const center = resistImage[i][i];
            const right = resistImage[i][i + 1];
            if (center !== left || center !== right) {
                epe.push(Math.abs(center - 0.5) * 2);
            }
        }
        return epe;
    }
    extractCD(resistImage) {
        return resistImage.map((row) => {
            let cd = 0;
            for (const v of row) {
                if (v > 0.5)
                    cd++;
            }
            return cd * 0.5;
        });
    }
}
//# sourceMappingURL=fdtd-simulator.js.map