import { useStore } from '../store/useStore';
import { useCommandManager } from '../hooks/useCommandManager';
import type { SceneObject, Vec3 } from '../store/useStore';
import { Command } from '../core/commands/Command';
import * as THREE from 'three';

/**
 * Command that syncs Three.js scene with Zustand store
 */
class EditorCommand extends Command {
  private executeImpl: () => void;
  private undoImpl: () => void;

  constructor(description: string, executeImpl: () => void, undoImpl: () => void) {
    super(description);
    this.executeImpl = executeImpl;
    this.undoImpl = undoImpl;
  }

  execute(): void {
    this.executeImpl();
  }

  undo(): void {
    this.undoImpl();
  }
}

/**
 * Custom hook that provides command-based operations for the 3D editor
 */
export function useEditorCommands() {
  const store = useStore();
  const commandManager = useCommandManager({
    maxHistorySize: 100,
    mergeTimeout: 1000
  });

  /**
   * Create a Three.js object from a SceneObject
   */
  const createThreeObject = (sceneObj: SceneObject): THREE.Object3D => {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    // Create geometry based on type - matching SceneObjects.tsx dimensions
    switch (sceneObj.type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(20, 20, 20); // Match CUBE_DIMS
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(10, 32, 16); // Match SceneObjects sphere
        break;
      case 'text':
        // For text, we'll use a simple box as placeholder for now
        geometry = new THREE.BoxGeometry(1, 0.2, 0.1);
        break;
      default:
        geometry = new THREE.BoxGeometry(20, 20, 20);
    }

    // Create material
    const color = sceneObj.color ? new THREE.Color(sceneObj.color) : new THREE.Color(0x00ff00);
    material = new THREE.MeshStandardMaterial({ color });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Set transform
    mesh.position.set(...sceneObj.position);
    mesh.rotation.set(...sceneObj.rotation);
    mesh.scale.set(...sceneObj.scale);
    
    // Store metadata
    mesh.userData = {
      id: sceneObj.id,
      type: sceneObj.type,
      name: sceneObj.name,
      text: sceneObj.text
    };

    return mesh;
  };

  /**
   * Find Three.js object by SceneObject ID
   */
  const findThreeObjectById = (scene: THREE.Scene, id: string): THREE.Object3D | null => {
    return scene.getObjectByProperty('userData.id', id) || null;
  };

  /**
   * Add object to scene with command
   */
  const addObject = (sceneObj: SceneObject) => {
    const command = new EditorCommand(
      `Add ${sceneObj.type || 'Object'}`,
      () => {
        // Only add to store - SceneObjects.tsx will handle Three.js creation
        store.addObject(sceneObj);
      },
      () => {
        // Remove from store - SceneObjects.tsx will handle Three.js removal
        store.removeObject(sceneObj.id);
      }
    );
    
    commandManager.executeCommand(command);
  };

  /**
   * Delete object from scene with command
   */
  const deleteObject = (id: string) => {
    const sceneObj = store.objects.find(obj => obj.id === id);
    if (!sceneObj) return;

    const command = new EditorCommand(
      `Delete ${sceneObj.type || 'Object'}`,
      () => {
        // Only remove from store - SceneObjects.tsx will handle Three.js removal
        store.removeObject(id);
        if (store.selectedId === id) {
          store.setSelected(null);
        }
      },
      () => {
        // Only add back to store - SceneObjects.tsx will handle Three.js creation
        store.addObject(sceneObj);
      }
    );
    
    commandManager.executeCommand(command);
  };

  /**
   * Transform object with command
   */
  const transformObject = (
    id: string, 
    newPosition?: Vec3, 
    newRotation?: Vec3, 
    newScale?: Vec3,
    scene?: THREE.Scene,
    transformType: string = 'transform'
  ) => {
    const sceneObj = store.objects.find(obj => obj.id === id);
    if (!sceneObj) return;

    const threeObj = scene ? findThreeObjectById(scene, id) : null;
    
    // Store old values
    const oldPosition = [...sceneObj.position] as Vec3;
    const oldRotation = [...sceneObj.rotation] as Vec3;
    const oldScale = [...sceneObj.scale] as Vec3;

    const command = new EditorCommand(
      `${transformType.charAt(0).toUpperCase() + transformType.slice(1)} ${sceneObj.type || 'Object'}`,
      () => {
        if (threeObj) {
          if (newPosition) threeObj.position.set(...newPosition);
          if (newRotation) threeObj.rotation.set(...newRotation);
          if (newScale) threeObj.scale.set(...newScale);
        }
        
        const updates: Partial<SceneObject> = {};
        if (newPosition) updates.position = newPosition;
        if (newRotation) updates.rotation = newRotation;
        if (newScale) updates.scale = newScale;
        store.updateObject(id, updates);
      },
      () => {
        if (threeObj) {
          threeObj.position.set(...oldPosition);
          threeObj.rotation.set(...oldRotation);
          threeObj.scale.set(...oldScale);
        }
        
        store.updateObject(id, {
          position: oldPosition,
          rotation: oldRotation,
          scale: oldScale
        });
      }
    );
    
    commandManager.executeCommand(command);
  };

  /**
   * Change object color with command
   */
  const changeObjectColor = (id: string, newColor: string, scene?: THREE.Scene) => {
    const sceneObj = store.objects.find(obj => obj.id === id);
    if (!sceneObj) return;

    const threeObj = scene ? findThreeObjectById(scene, id) : null;
    const oldColor = sceneObj.color || '#00ff00';

    const command = new EditorCommand(
      `Change Color of ${sceneObj.type || 'Object'}`,
      () => {
        if (threeObj && threeObj instanceof THREE.Mesh && threeObj.material instanceof THREE.Material) {
          if ('color' in threeObj.material) {
            (threeObj.material as any).color.set(newColor);
          }
        }
        store.updateObject(id, { color: newColor });
      },
      () => {
        if (threeObj && threeObj instanceof THREE.Mesh && threeObj.material instanceof THREE.Material) {
          if ('color' in threeObj.material) {
            (threeObj.material as any).color.set(oldColor);
          }
        }
        store.updateObject(id, { color: oldColor });
      }
    );
    
    commandManager.executeCommand(command);
  };

  /**
   * Transform object from current Three.js state to new store values with command
   */
  const transformObjectFromThreeJS = (
    id: string,
    threeJSObject: THREE.Object3D,
    oldStoreValues: {
      position: Vec3;
      rotation: Vec3;
      scale: Vec3;
    },
    transformType: string = 'transform'
  ) => {
    // Get current Three.js values
    const newPosition: Vec3 = [threeJSObject.position.x, threeJSObject.position.y, threeJSObject.position.z];
    const newRotation: Vec3 = [threeJSObject.rotation.x, threeJSObject.rotation.y, threeJSObject.rotation.z];
    const newScale: Vec3 = [threeJSObject.scale.x, threeJSObject.scale.y, threeJSObject.scale.z];

    const command = new EditorCommand(
      `${transformType.charAt(0).toUpperCase() + transformType.slice(1)} ${threeJSObject.userData.type || 'Object'}`,
      () => {
        // Execute: update store to match Three.js current state
        const updates: Partial<SceneObject> = {
          position: newPosition,
          rotation: newRotation,
          scale: newScale
        };
        store.updateObject(id, updates);
      },
      () => {
        // Undo: restore both Three.js and store to old values
        threeJSObject.position.set(...oldStoreValues.position);
        threeJSObject.rotation.set(...oldStoreValues.rotation);
        threeJSObject.scale.set(...oldStoreValues.scale);
        
        store.updateObject(id, {
          position: oldStoreValues.position,
          rotation: oldStoreValues.rotation,
          scale: oldStoreValues.scale
        });
      }
    );
    
    commandManager.executeCommand(command);
  };

  /**
   * Move object to position with command
   */
  const moveObject = (id: string, newPosition: Vec3, scene?: THREE.Scene) => {
    transformObject(id, newPosition, undefined, undefined, scene, 'move');
  };

  /**
   * Rotate object with command
   */
  const rotateObject = (id: string, newRotation: Vec3, scene?: THREE.Scene) => {
    transformObject(id, undefined, newRotation, undefined, scene, 'rotate');
  };

  /**
   * Scale object with command
   */
  const scaleObject = (id: string, newScale: Vec3, scene?: THREE.Scene) => {
    transformObject(id, undefined, undefined, newScale, scene, 'scale');
  };

  /**
   * Clear all objects with command
   */
  const clearScene = (scene?: THREE.Scene) => {
    const currentObjects = [...store.objects];
    const currentSelection = store.selectedId;
    
    const command = new EditorCommand(
      'Clear Scene',
      () => {
        if (scene) {
          const objectsToRemove = scene.children.filter(child => child.userData.id);
          objectsToRemove.forEach(obj => scene.remove(obj));
        }
        store.reset();
      },
      () => {
        currentObjects.forEach(obj => {
          if (scene) {
            const threeObj = createThreeObject(obj);
            scene.add(threeObj);
          }
          store.addObject(obj);
        });
        if (currentSelection) {
          store.setSelected(currentSelection);
        }
      }
    );
    
    commandManager.executeCommand(command);
  };

  return {
    // Command operations
    addObject,
    deleteObject,
    transformObject,
    transformObjectFromThreeJS,
    changeObjectColor,
    moveObject,
    rotateObject,
    scaleObject,
    clearScene,
    
    // Command manager access
    undo: commandManager.undo,
    redo: commandManager.redo,
    clear: commandManager.clear,
    state: commandManager.state,
    executeCommand: commandManager.executeCommand,
    
    // Utility functions
    createThreeObject,
    findThreeObjectById,
    
    // Store access (for non-command operations)
    store
  };
}