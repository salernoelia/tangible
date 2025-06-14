import p5 from 'p5';

export function drawOptimizedDotGrid(
    p: p5,
    zoom: { value: number },
    offsetX: { value: number },
    offsetY: { value: number },
    baseGridSpacing: number,
    effectiveDotSize: { value: number },
    lastDrawnBounds: { startX: number; endX: number; startY: number; endY: number }
) {
    const spacing = baseGridSpacing;
    const size = effectiveDotSize.value;
    const currentZoom = zoom.value;
    
    const worldLeft = -offsetX.value / currentZoom;
    const worldRight = (p.width - offsetX.value) / currentZoom;
    const worldTop = -offsetY.value / currentZoom;
    const worldBottom = (p.height - offsetY.value) / currentZoom;
    
    const padding = spacing * 3;
    
    const startX = Math.floor((worldLeft - padding) / spacing) * spacing;
    const endX = Math.ceil((worldRight + padding) / spacing) * spacing;
    const startY = Math.floor((worldTop - padding) / spacing) * spacing;
    const endY = Math.ceil((worldBottom + padding) / spacing) * spacing;
    
    let alpha = 255;
    let strokeWeight = 0;
    
    if (currentZoom < 0.3) {
        alpha = Math.max(50, 150 * currentZoom / 0.3);
    } else if (currentZoom > 2) {
        strokeWeight = 0.5;
        p.stroke(100, 100, 100, alpha * 0.3);
        p.strokeWeight(strokeWeight);
    } else {
        p.noStroke();
    }
    
    p.fill(120, 120, 120, alpha);
    
    const gridStepsX = Math.round((endX - startX) / spacing);
    const gridStepsY = Math.round((endY - startY) / spacing);
    
    for (let i = 0; i <= gridStepsX; i++) {
        const x = startX + i * spacing;
        for (let j = 0; j <= gridStepsY; j++) {
            const y = startY + j * spacing;
            
            if (x >= worldLeft - padding && x <= worldRight + padding &&
                y >= worldTop - padding && y <= worldBottom + padding) {
                p.ellipse(x, y, size, size);
            }
        }
    }
    
    lastDrawnBounds.startX = Math.round(startX);
    lastDrawnBounds.endX = Math.round(endX);
    lastDrawnBounds.startY = Math.round(startY);
    lastDrawnBounds.endY = Math.round(endY);
}