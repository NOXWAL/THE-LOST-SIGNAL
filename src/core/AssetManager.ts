import * as THREE from 'three';
import { IAssetManager } from '../types';

export class AssetManager implements IAssetManager {
  private textures: Map<string, THREE.Texture> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private cache: Map<string, any> = new Map();
  private textureLoader = new THREE.TextureLoader();
  private audioContext: AudioContext | null = null;

  constructor() {
    // AudioContext is initialized on user interaction if needed
  }

  public resolvePath(url: string): string {
    if (/^(https?:|\/\/|data:|blob:)/i.test(url)) {
      return url;
    }
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${cleanBase}${cleanUrl}`;
  }

  public async preloadAll(): Promise<void> {
    console.log('[AssetManager] Preloading manifest...');
    // In production, load manifest json from public
  }

  public async loadTexture(url: string): Promise<THREE.Texture> {
    const resolvedUrl = this.resolvePath(url);
    if (this.textures.has(resolvedUrl)) {
      return this.textures.get(resolvedUrl)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        resolvedUrl,
        (texture) => {
          this.textures.set(resolvedUrl, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.warn(`[AssetManager] Texture load failed for ${resolvedUrl}, fallback generated`, error);
          const fallback = this.createFallbackTexture();
          this.textures.set(resolvedUrl, fallback);
          resolve(fallback);
        }
      );
    });
  }

  public async loadAudio(url: string): Promise<AudioBuffer> {
    const resolvedUrl = this.resolvePath(url);
    if (this.audioBuffers.has(resolvedUrl)) {
      return this.audioBuffers.get(resolvedUrl)!;
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      const response = await fetch(resolvedUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(resolvedUrl, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn(`[AssetManager] Audio load failed for ${resolvedUrl}`, e);
      throw e;
    }
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get(key) as T;
  }

  public set<T>(key: string, asset: T): void {
    this.cache.set(key, asset);
  }

  private createFallbackTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillRect(32, 32, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
