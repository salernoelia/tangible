import p5 from 'p5';

export interface MediaResource {
    id: string;
    type: 'image' | 'video' | 'camera' | 'shader';
    element: HTMLImageElement | HTMLVideoElement | p5.MediaElement | p5.Image;
    isLoaded: boolean;
    width: number;
    height: number;
    isPlaying?: boolean;
}

export class MediaManager {
    private static instance: MediaManager;
    private p5Instance: p5 | null = null;
    private resources = new Map<string, MediaResource>();
    private cameraStream: MediaStream | null = null;
    private videoAutoplay = new Map<string, boolean>();

    static getInstance(): MediaManager {
        if (!MediaManager.instance) {
            MediaManager.instance = new MediaManager();
        }
        return MediaManager.instance;
    }

    setP5Instance(p: p5): void {
        this.p5Instance = p;
    }

    loadImage(id: string, path: string): Promise<MediaResource> {
        return new Promise((resolve, reject) => {
            if (!this.p5Instance) {
                reject(new Error('P5 instance not set'));
                return;
            }

            const existing = this.resources.get(id);
            if (existing && existing.isLoaded) {
                resolve(existing);
                return;
            }

            const img = this.p5Instance.loadImage(path, 
                (loadedImg) => {
                    if (loadedImg && loadedImg.width > 0 && loadedImg.height > 0) {
                        const resource: MediaResource = {
                            id,
                            type: 'image',
                            element: loadedImg,
                            isLoaded: true,
                            width: loadedImg.width,
                            height: loadedImg.height
                        };
                        this.resources.set(id, resource);
                        resolve(resource);
                    } else {
                        reject(new Error(`Invalid image loaded: ${path}`));
                    }
                },
                (err) => {
                    console.error(`Failed to load image: ${path}`, err);
                    reject(new Error(`Failed to load image: ${path}`));
                }
            );
        });
    }

    loadVideo(id: string, path: string, autoplay: boolean = true): Promise<MediaResource> {
        return new Promise((resolve, reject) => {
            if (!this.p5Instance) {
                reject(new Error('P5 instance not set'));
                return;
            }

            const existing = this.resources.get(id);
            if (existing && existing.isLoaded) {
                resolve(existing);
                return;
            }

            const video = this.p5Instance.createVideo(path, () => {
                video.volume(0);
                
                const resource: MediaResource = {
                    id,
                    type: 'video',
                    element: video,
                    isLoaded: true,
                    width: video.width || 640,
                    height: video.height || 480,
                    isPlaying: false
                };
                
                this.resources.set(id, resource);
                this.videoAutoplay.set(id, autoplay);
                
                // Start video if autoplay is enabled
                if (autoplay) {
                    this.startVideo(id);
                }
                
                resolve(resource);
            });

            video.elt.onerror = () => {
                console.error(`Failed to load video: ${path}`);
                reject(new Error(`Failed to load video: ${path}`));
            };

            // Handle video end
            video.onended(() => {
                if (this.videoAutoplay.get(id)) {
                    video.loop();
                }
            });
        });
    }

    async initializeCamera(id: string = 'camera'): Promise<MediaResource> {
        // Check if already initialized
        const existing = this.resources.get(id);
        if (existing && existing.isLoaded) {
            return existing;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30, max: 30 }
                } 
            });
            
            this.cameraStream = stream;
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.style.display = 'none'; // Hide the video element
            
            // Add to DOM temporarily for proper initialization
            document.body.appendChild(video);
            
            return new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    video.play().then(() => {
                        const resource: MediaResource = {
                            id,
                            type: 'camera',
                            element: video,
                            isLoaded: true,
                            width: video.videoWidth || 640,
                            height: video.videoHeight || 480,
                            isPlaying: true
                        };
                        
                        this.resources.set(id, resource);
                        resolve(resource);
                    }).catch(reject);
                };
                
                video.onerror = () => {
                    document.body.removeChild(video);
                    reject(new Error('Failed to initialize camera video element'));
                };
                
                // Timeout for safety
                setTimeout(() => {
                    if (!this.resources.has(id)) {
                        document.body.removeChild(video);
                        reject(new Error('Camera initialization timeout'));
                    }
                }, 5000);
            });
        } catch (error) {
            throw new Error(`Camera access denied: ${error}`);
        }
    }

    getResource(id: string): MediaResource | null {
        return this.resources.get(id) || null;
    }

    stopCamera(): void {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Clean up camera video elements
        this.resources.forEach((resource, id) => {
            if (resource.type === 'camera' && resource.element instanceof HTMLVideoElement) {
                if (resource.element.parentNode) {
                    resource.element.parentNode.removeChild(resource.element);
                }
                this.resources.delete(id);
            }
        });
    }

    startVideo(id: string): void {
        const resource = this.resources.get(id);
        if (resource && resource.type === 'video') {
            const video = resource.element as p5.MediaElement;
            try {
                video.loop();
                video.play();
                resource.isPlaying = true;
            } catch (error) {
                console.warn('Could not start video playback:', error);
            }
        }
    }

    stopVideo(id: string): void {
        const resource = this.resources.get(id);
        if (resource && resource.type === 'video') {
            const video = resource.element as p5.MediaElement;
            try {
                video.pause();
                resource.isPlaying = false;
            } catch (error) {
                console.warn('Could not stop video playback:', error);
            }
        }
    }

    toggleVideoAutoplay(id: string): void {
        const current = this.videoAutoplay.get(id) || false;
        this.videoAutoplay.set(id, !current);
        
        if (!current) {
            this.startVideo(id);
        } else {
            this.stopVideo(id);
        }
    }

    drawMedia(p: p5, resource: MediaResource, x: number, y: number, w: number, h: number): void {
        if (!resource || !resource.isLoaded || !resource.element) {
            return;
        }

        try {
            if (resource.type === 'image') {
                const img = resource.element as p5.Image;
                if (img && img.width > 0 && img.height > 0) {
                    p.image(img, x, y, w, h);
                }
            } else if (resource.type === 'video') {
                const video = resource.element as p5.MediaElement;
                if (video && video.elt && video.elt.readyState >= 2) {
                    p.image(video, x, y, w, h);
                }
            } else if (resource.type === 'camera') {
                const video = resource.element as HTMLVideoElement;
                if (video && video.readyState >= 2 && video.videoWidth > 0) {
                    p.image(video as any, x, y, w, h);
                }
            }
        } catch (error) {
            console.warn('Error drawing media:', error);
        }
    }
}