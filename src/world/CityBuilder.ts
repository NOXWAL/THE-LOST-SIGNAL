import * as THREE from 'three';
import { Physics } from '../systems/Physics';

export class CityBuilder {
  public group = new THREE.Group();
  private physics: Physics;

  // Shared reusable materials for performance
  private asphaltMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.8, metalness: 0.1 });
  private roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  private sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  private glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.7 });
  private concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
  private brickMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.9 });
  private metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 });
  private foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
  private barkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  private neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  private neonAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  constructor(physics: Physics) {
    this.physics = physics;
  }

  public buildEntireWorld(): THREE.Group {
    this.buildRoadNetwork();
    this.buildDowntownSkyscrapers();
    this.buildResidentialDistrict();
    this.buildIndustrialZone();
    this.buildForestOutskirts();
    this.buildUndergroundFacility();
    this.buildStreetPropsAndVehicles();
    this.buildRiverAndBridges();

    return this.group;
  }

  private buildRoadNetwork(): void {
    // Main Avenues & Cross Streets
    const roads = [
      // Central North-South Boulevard (X: 70-90)
      { x: 80, z: 80, length: 700, width: 14, rotY: 0 },
      // East-West Expressway (Z: 70-90)
      { x: 80, z: 80, length: 700, width: 14, rotY: Math.PI / 2 },
      // Downtown Grid Streets
      { x: 220, z: 220, length: 300, width: 12, rotY: 0 },
      { x: 220, z: 220, length: 300, width: 12, rotY: Math.PI / 2 },
      // Residential Grid Streets
      { x: -80, z: 220, length: 300, width: 12, rotY: 0 },
      { x: -80, z: 220, length: 300, width: 12, rotY: Math.PI / 2 },
      // Industrial Access Roads
      { x: 220, z: -80, length: 300, width: 12, rotY: 0 },
      { x: 220, z: -80, length: 300, width: 12, rotY: Math.PI / 2 }
    ];

    roads.forEach((r) => {
      // Asphalt Plane
      const geom = new THREE.PlaneGeometry(r.width, r.length);
      geom.rotateX(-Math.PI / 2);
      if (r.rotY !== 0) geom.rotateY(r.rotY);

      const mesh = new THREE.Mesh(geom, this.asphaltMat);
      mesh.position.set(r.x, 0.05, r.z);
      mesh.receiveShadow = true;
      this.group.add(mesh);

      // Yellow Center Dash Markings
      const dashGeom = new THREE.PlaneGeometry(0.3, r.length);
      dashGeom.rotateX(-Math.PI / 2);
      if (r.rotY !== 0) dashGeom.rotateY(r.rotY);
      const dash = new THREE.Mesh(dashGeom, this.roadMarkingMat);
      dash.position.set(r.x, 0.06, r.z);
      this.group.add(dash);

      // Sidewalks on both sides
      const swWidth = 3;
      const swGeom = new THREE.BoxGeometry(swWidth, 0.3, r.length);
      const sw1 = new THREE.Mesh(swGeom, this.sidewalkMat);
      const sw2 = new THREE.Mesh(swGeom, this.sidewalkMat);

      if (r.rotY === 0) {
        sw1.position.set(r.x - r.width / 2 - swWidth / 2, 0.15, r.z);
        sw2.position.set(r.x + r.width / 2 + swWidth / 2, 0.15, r.z);
      } else {
        sw1.position.set(r.x, 0.15, r.z - r.width / 2 - swWidth / 2);
        sw2.position.set(r.x, 0.15, r.z + r.width / 2 + swWidth / 2);
        sw1.rotation.y = Math.PI / 2;
        sw2.rotation.y = Math.PI / 2;
      }
      sw1.receiveShadow = true;
      sw2.receiveShadow = true;
      this.group.add(sw1);
      this.group.add(sw2);
    });
  }

  private buildDowntownSkyscrapers(): void {
    // Downtown Cluster (X: 130 to 350, Z: 130 to 350)
    const buildings = [
      { x: 150, z: 150, w: 32, d: 32, h: 110, color: 0x1e293b, name: 'Vance Tower' },
      { x: 220, z: 150, w: 28, d: 36, h: 85, color: 0x0f172a, name: 'Metro Financial' },
      { x: 290, z: 150, w: 35, d: 30, h: 130, color: 0x1e1e24, name: 'Apex Zenith Center' },
      { x: 150, z: 240, w: 30, d: 32, h: 95, color: 0x1e293b, name: 'Horizon Plaza' },
      { x: 220, z: 240, w: 40, d: 40, h: 145, color: 0x0f172a, name: 'ChronoTech Global HQ' },
      { x: 290, z: 240, w: 34, d: 30, h: 75, color: 0x334155, name: 'City Central Station' },
      { x: 150, z: 310, w: 36, d: 28, h: 90, color: 0x1e293b, name: 'Grand Omni Hotel' },
      { x: 240, z: 310, w: 38, d: 32, h: 115, color: 0x0f172a, name: 'Media Net Building' },
      { x: 310, z: 310, w: 30, d: 30, h: 80, color: 0x1e293b, name: 'Sentinel Heights' }
    ];

    buildings.forEach((b) => {
      // Main Body
      const bodyGeom = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.3,
        metalness: 0.7
      });
      const buildingMesh = new THREE.Mesh(bodyGeom, bodyMat);
      buildingMesh.position.set(b.x, b.h / 2, b.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      this.group.add(buildingMesh);

      // Register Physics Collider
      this.physics.addBoxCollider(
        new THREE.Vector3(b.x - b.w / 2, 0, b.z - b.d / 2),
        new THREE.Vector3(b.x + b.w / 2, b.h, b.z + b.d / 2),
        b.name
      );

      // Glass Curtain Facade Windows
      const windowRows = Math.floor(b.h / 5);
      const windowCols = Math.floor(b.w / 6);
      for (let r = 1; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
          if (Math.random() > 0.4) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), this.glassMat);
            win.position.set(b.x - b.w / 2 + 3 + c * 6, r * 5, b.z + b.d / 2 + 0.05);
            this.group.add(win);
          }
        }
      }

      // Rooftop AC and Communications Antenna
      const roofAC = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 8), this.metalMat);
      roofAC.position.set(b.x - 4, b.h + 2, b.z);
      this.group.add(roofAC);

      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 24, 6), this.metalMat);
      antenna.position.set(b.x + 6, b.h + 12, b.z);
      const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      beaconLight.position.set(b.x + 6, b.h + 24, b.z);
      this.group.add(antenna);
      this.group.add(beaconLight);

      // Neon Signage on HQ
      if (b.name.includes('ChronoTech')) {
        const sign = new THREE.Mesh(new THREE.BoxGeometry(22, 4, 0.6), this.neonCyanMat);
        sign.position.set(b.x, 25, b.z + b.d / 2 + 0.4);
        this.group.add(sign);
      }
    });
  }

  private buildResidentialDistrict(): void {
    // Westside Residential (X: -220 to 50, Z: 100 to 350)
    // Brownstone rowhouses, apartment buildings, alleyways, safehouse apartment (Mission 01)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const bx = -50 - col * 34;
        const bz = 130 + row * 45;
        const h = 18 + (col % 2) * 8; // 3 to 5 floors
        const w = 24;
        const d = 20;

        const isSafehouse = row === 1 && col === 1;

        const geom = new THREE.BoxGeometry(w, h, d);
        const mat = isSafehouse ? new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }) : this.brickMat;
        const house = new THREE.Mesh(geom, mat);
        house.position.set(bx, h / 2, bz);
        house.castShadow = true;
        house.receiveShadow = true;
        this.group.add(house);

        this.physics.addBoxCollider(
          new THREE.Vector3(bx - w / 2, 0, bz - d / 2),
          new THREE.Vector3(bx + w / 2, h, bz + d / 2),
          isSafehouse ? 'Safehouse Apartment' : 'Residential Block'
        );

        // Front Stoop Steps & Doorway
        const stoop = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 5), this.concreteMat);
        stoop.position.set(bx, 0.6, bz - d / 2 - 2.5);
        this.group.add(stoop);

        const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4, 0.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        door.position.set(bx, 3.2, bz - d / 2 - 0.05);
        this.group.add(door);

        // Windows with illuminated evening warmth
        for (let floor = 1; floor <= Math.floor(h / 5); floor++) {
          const winL = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), this.neonAmberMat);
          winL.position.set(bx - 6, floor * 5, bz - d / 2 - 0.06);
          winL.rotation.y = Math.PI;
          this.group.add(winL);

          const winR = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), this.neonAmberMat);
          winR.position.set(bx + 6, floor * 5, bz - d / 2 - 0.06);
          winR.rotation.y = Math.PI;
          this.group.add(winR);
        }
      }
    }
  }

  private buildIndustrialZone(): void {
    // Industrial District (X: 100 to 350, Z: -220 to 50)
    // Warehouses, shipping containers, abandoned research annex (Mission 02), cranes, storm canal
    const industrialProps = [
      { x: 150, z: -80, w: 50, d: 70, h: 22, name: 'Abandoned ChronoTech Office (Mission 02)' },
      { x: 230, z: -80, w: 60, d: 50, h: 18, name: 'Freight Warehouse Alpha' },
      { x: 300, z: -80, w: 50, d: 80, h: 24, name: 'Heavy Machinery Plant' },
      { x: 150, z: -170, w: 45, d: 50, h: 20, name: 'Logistics Depot' },
      { x: 240, z: -170, w: 70, d: 60, h: 26, name: 'Chemical Processing Yard' }
    ];

    industrialProps.forEach((ind) => {
      const geom = new THREE.BoxGeometry(ind.w, ind.h, ind.d);
      const mat = ind.name.includes('Abandoned')
        ? new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95, metalness: 0.3 })
        : new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.5 });

      const factory = new THREE.Mesh(geom, mat);
      factory.position.set(ind.x, ind.h / 2, ind.z);
      factory.castShadow = true;
      factory.receiveShadow = true;
      this.group.add(factory);

      this.physics.addBoxCollider(
        new THREE.Vector3(ind.x - ind.w / 2, 0, ind.z - ind.d / 2),
        new THREE.Vector3(ind.x + ind.w / 2, ind.h, ind.z + ind.d / 2),
        ind.name
      );

      // Corrugated Roof Trim
      const roof = new THREE.Mesh(new THREE.BoxGeometry(ind.w + 2, 2, ind.d + 2), this.metalMat);
      roof.position.set(ind.x, ind.h + 1, ind.z);
      this.group.add(roof);

      // Industrial Exhaust Silos
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 28, 12), this.metalMat);
      silo.position.set(ind.x - ind.w / 2 - 5, 14, ind.z);
      this.group.add(silo);
    });

    // Stacks of Shipping Containers
    const containerColors = [0x0284c7, 0xd97706, 0x059669, 0xdc2626];
    for (let i = 0; i < 18; i++) {
      const cx = 130 + (i % 6) * 16;
      const cz = -20 - Math.floor(i / 6) * 12;
      const color = containerColors[i % containerColors.length];

      const cGeom = new THREE.BoxGeometry(14, 5, 6);
      const cMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.4 });
      const cont = new THREE.Mesh(cGeom, cMat);
      cont.position.set(cx, 2.5, cz);
      cont.castShadow = true;
      this.group.add(cont);

      this.physics.addBoxCollider(
        new THREE.Vector3(cx - 7, 0, cz - 3),
        new THREE.Vector3(cx + 7, 5, cz + 3),
        'Shipping Container'
      );
    }

    // Industrial Storm Canal & Underground Bunker Entrance (Mission 04)
    const bunkerHatch = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 4, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    bunkerHatch.position.set(180, 0.6, -120);
    this.group.add(bunkerHatch);

    const redWarningLight = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    redWarningLight.position.set(180, 2, -120);
    this.group.add(redWarningLight);
  }

  private buildForestOutskirts(): void {
    // Northwood Forest (X: -320 to 0, Z: -320 to 0)
    // Instanced pine trees, rocky crags, winding dirt clearing, Marcus's Cabin (Mission 03), Relay Tower
    const treeCount = 90;
    const trunkGeom = new THREE.CylinderGeometry(0.4, 0.6, 6, 6);
    const foliageGeom = new THREE.ConeGeometry(3.5, 12, 6);

    for (let i = 0; i < treeCount; i++) {
      const tx = -50 - Math.random() * 260;
      const tz = -50 - Math.random() * 260;

      // Don't spawn on Marcus's cabin location
      if (Math.hypot(tx - (-180), tz - (-180)) < 25) continue;

      const trunk = new THREE.Mesh(trunkGeom, this.barkMat);
      trunk.position.set(tx, 3, tz);
      trunk.castShadow = true;
      this.group.add(trunk);

      const foliage = new THREE.Mesh(foliageGeom, this.foliageMat);
      foliage.position.set(tx, 10, tz);
      foliage.castShadow = true;
      this.group.add(foliage);

      // Register collision with tree trunk
      this.physics.addBoxCollider(
        new THREE.Vector3(tx - 0.8, 0, tz - 0.8),
        new THREE.Vector3(tx + 0.8, 15, tz + 0.8),
        'Pine Tree'
      );
    }

    // Marcus's Hidden Forest Cabin (Mission 03)
    const cabinGeom = new THREE.BoxGeometry(16, 7, 14);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.95 });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(-180, 3.5, -180);
    cabin.castShadow = true;
    this.group.add(cabin);

    this.physics.addBoxCollider(
      new THREE.Vector3(-180 - 8, 0, -180 - 7),
      new THREE.Vector3(-180 + 8, 7, -180 + 7),
      'Marcus Cabin'
    );

    // Cabin Porch Lantern
    const porchLight = new THREE.PointLight(0xf59e0b, 2.5, 20);
    porchLight.position.set(-180, 5, -172);
    this.group.add(porchLight);

    // Mountain Radio Relay Tower
    const towerTruss = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 4.5, 60, 4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, wireframe: false })
    );
    towerTruss.position.set(-260, 30, -240);
    this.group.add(towerTruss);

    const towerDish = new THREE.Mesh(
      new THREE.SphereGeometry(5, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
    );
    towerDish.position.set(-260, 58, -240);
    towerDish.rotation.x = Math.PI / 4;
    this.group.add(towerDish);

    const relayBeaconLight = new THREE.PointLight(0x06b6d4, 4, 80);
    relayBeaconLight.position.set(-260, 62, -240);
    this.group.add(relayBeaconLight);
  }

  private buildUndergroundFacility(): void {
    // Subterranean Site-Zero (Located at Y: -35 to -20, coordinate X: 600, Z: 600)
    // High-tech containment complex with blast doors, server aisles, holographic resonance core (Mission 05)
    const floorGeom = new THREE.PlaneGeometry(160, 160);
    floorGeom.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.set(600, -35, 600);
    floor.receiveShadow = true;
    this.group.add(floor);

    // Laboratory Perimeter Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const wallH = 14;

    const walls = [
      { x: 600, z: 520, w: 160, d: 4 },
      { x: 600, z: 680, w: 160, d: 4 },
      { x: 520, z: 600, w: 4, d: 160 },
      { x: 680, z: 600, w: 4, d: 160 }
    ];

    walls.forEach((w) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, wallH, w.d), wallMat);
      mesh.position.set(w.x, -35 + wallH / 2, w.z);
      this.group.add(mesh);

      this.physics.addBoxCollider(
        new THREE.Vector3(w.x - w.w / 2, -35, w.z - w.d / 2),
        new THREE.Vector3(w.x + w.w / 2, -35 + wallH, w.z + w.d / 2),
        'Lab Wall'
      );
    });

    // Sub-Zero Resonance Core Chamber (Mission 05)
    const corePillarGeom = new THREE.CylinderGeometry(3, 4, 12, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x083344, roughness: 0.1, metalness: 0.9 });
    const corePillar = new THREE.Mesh(corePillarGeom, coreMat);
    corePillar.position.set(600, -29, 600);
    this.group.add(corePillar);

    const orbGeom = new THREE.SphereGeometry(4, 32, 32);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true });
    const anomalousCoreOrb = new THREE.Mesh(orbGeom, orbMat);
    anomalousCoreOrb.position.set(600, -20, 600);
    this.group.add(anomalousCoreOrb);

    const coreLight = new THREE.PointLight(0x06b6d4, 6, 60);
    coreLight.position.set(600, -20, 600);
    this.group.add(coreLight);

    // Server Racks in rows
    for (let r = 0; r < 4; r++) {
      const rackGeom = new THREE.BoxGeometry(20, 9, 3);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.4 });
      const rack = new THREE.Mesh(rackGeom, rackMat);
      rack.position.set(560 + r * 25, -30.5, 560);
      this.group.add(rack);

      this.physics.addBoxCollider(
        new THREE.Vector3(560 + r * 25 - 10, -35, 560 - 1.5),
        new THREE.Vector3(560 + r * 25 + 10, -25, 560 + 1.5),
        'Server Rack'
      );
    }
  }

  private buildStreetPropsAndVehicles(): void {
    // Streetlights along avenues
    const lightPositions = [
      { x: 72, z: 120 }, { x: 72, z: 180 }, { x: 72, z: 240 }, { x: 72, z: 300 },
      { x: 88, z: 120 }, { x: 88, z: 180 }, { x: 88, z: 240 }, { x: 88, z: 300 },
      { x: 120, z: 72 }, { x: 180, z: 72 }, { x: 240, z: 72 }, { x: 300, z: 72 }
    ];

    lightPositions.forEach((pos) => {
      // Lamp pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 9, 8), this.metalMat);
      pole.position.set(pos.x, 4.5, pos.z);
      this.group.add(pole);

      // Arm & Lantern
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 0.2), this.metalMat);
      arm.position.set(pos.x + 1, 8.8, pos.z);
      this.group.add(arm);

      const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lampHead.position.set(pos.x + 1.8, 8.5, pos.z);
      this.group.add(lampHead);

      const light = new THREE.PointLight(0xfef08a, 1.8, 28);
      light.position.set(pos.x + 1.8, 8.3, pos.z);
      this.group.add(light);
    });

    // Parked Vehicles
    const vehicles = [
      { x: 74, z: 140, type: 'sedan', color: 0x0284c7 },
      { x: 74, z: 200, type: 'van', color: 0xe2e8f0 },
      { x: 86, z: 170, type: 'police', color: 0x0f172a },
      { x: 160, z: 74, type: 'sedan', color: 0xef4444 },
      { x: 230, z: 74, type: 'van', color: 0x64748b }
    ];

    vehicles.forEach((v) => {
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.4, 4.8),
        new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.2, metalness: 0.8 })
      );
      chassis.position.set(v.x, 1.1, v.z);
      chassis.castShadow = true;
      this.group.add(chassis);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 1.1, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 })
      );
      cabin.position.set(v.x, 2.0, v.z - 0.2);
      this.group.add(cabin);

      // Police Lightbar
      if (v.type === 'police') {
        const lightbar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.5), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
        lightbar.position.set(v.x, 2.6, v.z - 0.2);
        this.group.add(lightbar);
      }

      this.physics.addBoxCollider(
        new THREE.Vector3(v.x - 1.4, 0, v.z - 2.6),
        new THREE.Vector3(v.x + 1.4, 2.5, v.z + 2.6),
        'Parked Vehicle'
      );
    });
  }

  private buildRiverAndBridges(): void {
    // River flowing through city separating districts
    const riverGeom = new THREE.PlaneGeometry(35, 750);
    riverGeom.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.85
    });
    const river = new THREE.Mesh(riverGeom, riverMat);
    river.position.set(40, -0.6, 80);
    this.group.add(river);

    // River Bridge crossing
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.5 })
    );
    bridge.position.set(40, 0.8, 80);
    this.group.add(bridge);
  }
}
