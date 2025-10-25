import * as THREE from 'three';
import { Command } from './Command';

/**
 * Command to add an object to the scene
 */
export class AddObjectCommand extends Command {
  private scene: THREE.Scene;
  private object: THREE.Object3D;
  private position: THREE.Vector3;

  constructor(scene: THREE.Scene, object: THREE.Object3D, position?: THREE.Vector3) {
    super(`Add ${object.userData.type || 'Object'}`);
    this.scene = scene;
    this.object = object;
    this.position = position ? position.clone() : new THREE.Vector3();
  }

  execute(): void {
    this.object.position.copy(this.position);
    this.scene.add(this.object);
  }

  undo(): void {
    this.scene.remove(this.object);
  }

  serialize() {
    return {
      ...super.serialize(),
      objectId: this.object.uuid,
      position: this.position.toArray()
    };
  }
}

/**
 * Command to delete an object from the scene
 */
export class DeleteObjectCommand extends Command {
  private scene: THREE.Scene;
  private object: THREE.Object3D;
  private position: THREE.Vector3;
  private rotation: THREE.Euler;
  private scale: THREE.Vector3;

  constructor(scene: THREE.Scene, object: THREE.Object3D) {
    super(`Delete ${object.userData.type || 'Object'}`);
    this.scene = scene;
    this.object = object;
    this.position = object.position.clone();
    this.rotation = object.rotation.clone();
    this.scale = object.scale.clone();
  }

  execute(): void {
    this.scene.remove(this.object);
  }

  undo(): void {
    this.object.position.copy(this.position);
    this.object.rotation.copy(this.rotation);
    this.object.scale.copy(this.scale);
    this.scene.add(this.object);
  }

  serialize() {
    return {
      ...super.serialize(),
      objectId: this.object.uuid,
      position: this.position.toArray(),
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
      scale: this.scale.toArray()
    };
  }
}

/**
 * Transform data interface
 */
export interface TransformData {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

/**
 * Command to transform an object (move, rotate, scale)
 */
export class TransformObjectCommand extends Command {
  private object: THREE.Object3D;
  private oldTransform: TransformData;
  private newTransform: TransformData;
  private transformType: string;

  constructor(
    object: THREE.Object3D, 
    oldTransform: TransformData, 
    newTransform: TransformData, 
    transformType: string = 'transform'
  ) {
    super(`${transformType.charAt(0).toUpperCase() + transformType.slice(1)} ${object.userData.type || 'Object'}`);
    this.object = object;
    this.oldTransform = this.cloneTransform(oldTransform);
    this.newTransform = this.cloneTransform(newTransform);
    this.transformType = transformType;
  }

  private cloneTransform(transform: TransformData): TransformData {
    return {
      position: transform.position?.clone(),
      rotation: transform.rotation?.clone(),
      scale: transform.scale?.clone()
    };
  }

  execute(): void {
    this.applyTransform(this.newTransform);
  }

  undo(): void {
    this.applyTransform(this.oldTransform);
  }

  private applyTransform(transform: TransformData): void {
    if (transform.position) {
      this.object.position.copy(transform.position);
    }
    if (transform.rotation) {
      this.object.rotation.copy(transform.rotation);
    }
    if (transform.scale) {
      this.object.scale.copy(transform.scale);
    }
  }

  canMerge(otherCommand: Command): boolean {
    return otherCommand instanceof TransformObjectCommand &&
           otherCommand.object === this.object &&
           otherCommand.transformType === this.transformType;
  }

  merge(otherCommand: Command): void {
    if (otherCommand instanceof TransformObjectCommand) {
      this.newTransform = this.cloneTransform(otherCommand.newTransform);
      // Note: timestamp is readonly, so we can't update it during merge
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      objectId: this.object.uuid,
      transformType: this.transformType,
      oldTransform: {
        position: this.oldTransform.position?.toArray(),
        rotation: this.oldTransform.rotation ? [this.oldTransform.rotation.x, this.oldTransform.rotation.y, this.oldTransform.rotation.z] : undefined,
        scale: this.oldTransform.scale?.toArray()
      },
      newTransform: {
        position: this.newTransform.position?.toArray(),
        rotation: this.newTransform.rotation ? [this.newTransform.rotation.x, this.newTransform.rotation.y, this.newTransform.rotation.z] : undefined,
        scale: this.newTransform.scale?.toArray()
      }
    };
  }
}

/**
 * Command to change object color/material
 */
export class ChangeColorCommand extends Command {
  private object: THREE.Object3D;
  private oldColor: number;
  private newColor: number;

  constructor(object: THREE.Object3D, oldColor: number, newColor: number) {
    super(`Change Color of ${object.userData.type || 'Object'}`);
    this.object = object;
    this.oldColor = oldColor;
    this.newColor = newColor;
  }

  execute(): void {
    this.setObjectColor(this.newColor);
  }

  undo(): void {
    this.setObjectColor(this.oldColor);
  }

  private setObjectColor(color: number): void {
    if (this.object instanceof THREE.Mesh && this.object.material instanceof THREE.Material) {
      if ('color' in this.object.material) {
        (this.object.material as any).color.setHex(color);
      }
    }
  }

  canMerge(otherCommand: Command): boolean {
    return otherCommand instanceof ChangeColorCommand &&
           otherCommand.object === this.object;
  }

  merge(otherCommand: Command): void {
    if (otherCommand instanceof ChangeColorCommand) {
      this.newColor = otherCommand.newColor;
      // Note: timestamp is readonly, so we can't update it during merge
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      objectId: this.object.uuid,
      oldColor: this.oldColor,
      newColor: this.newColor
    };
  }
}

/**
 * Command to change object material properties
 */
export class ChangeMaterialCommand extends Command {
  private object: THREE.Object3D;
  private oldMaterial: THREE.Material;
  private newMaterial: THREE.Material;

  constructor(object: THREE.Object3D, oldMaterial: THREE.Material, newMaterial: THREE.Material) {
    super(`Change Material of ${object.userData.type || 'Object'}`);
    this.object = object;
    this.oldMaterial = oldMaterial.clone();
    this.newMaterial = newMaterial.clone();
  }

  execute(): void {
    if (this.object instanceof THREE.Mesh) {
      this.object.material = this.newMaterial.clone();
    }
  }

  undo(): void {
    if (this.object instanceof THREE.Mesh) {
      this.object.material = this.oldMaterial.clone();
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      objectId: this.object.uuid,
      materialType: this.newMaterial.type
    };
  }
}

/**
 * Command to add text to the scene
 */
export class AddTextCommand extends Command {
  private scene: THREE.Scene;
  private textMesh: THREE.Mesh;
  private text: string;
  private position: THREE.Vector3;

  constructor(scene: THREE.Scene, textMesh: THREE.Mesh, text: string, position?: THREE.Vector3) {
    super(`Add Text: "${text}"`);
    this.scene = scene;
    this.textMesh = textMesh;
    this.text = text;
    this.position = position ? position.clone() : new THREE.Vector3();
  }

  execute(): void {
    this.textMesh.position.copy(this.position);
    this.textMesh.userData.type = 'Text';
    this.textMesh.userData.text = this.text;
    this.scene.add(this.textMesh);
  }

  undo(): void {
    this.scene.remove(this.textMesh);
  }

  serialize() {
    return {
      ...super.serialize(),
      text: this.text,
      position: this.position.toArray()
    };
  }
}

/**
 * Composite command to execute multiple commands as one
 */
export class CompositeCommand extends Command {
  private commands: Command[];

  constructor(commands: Command[], description?: string) {
    super(description || `Composite: ${commands.length} operations`);
    this.commands = commands;
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      commands: this.commands.map(cmd => cmd.serialize())
    };
  }
}