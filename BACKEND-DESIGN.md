# Backend Design for Scene Creation

## Overview
This document outlines the backend design for managing scenes in the database, utilizing a local Zustand store for state management, and the workflow for saving data.

## Entities
### Scene
- **id**: Unique identifier for the scene
- **name**: Name of the scene
- **userId**: Identifier for the user who created the scene
- **data**: JSON object containing all relevant data for the scene
- **createdAt**: Timestamp for when the scene was created
- **updatedAt**: Timestamp for when the scene was last updated

### User
- **id**: Unique identifier for the user
- **username**: Username of the user
- **email**: Email address of the user
- **passwordHash**: Hashed password for authentication

## Workflow
1. **User Creates a Scene**:
   - The user interacts with the frontend to create a new scene.
   - A new scene object is instantiated and stored in the local Zustand store.

2. **Working Locally**:
   - The user can make changes to the scene, which updates the local Zustand store.
   - All changes are reflected immediately in the UI, providing a seamless experience.

3. **Save to Database**:
   - When the user clicks the "Save" button, a request is sent to the backend.
   - The backend validates the scene data and then either creates a new record or updates an existing one in the database.
   - The scene's `updatedAt` timestamp is updated accordingly.

## Database Schema Example
```sql
CREATE TABLE scenes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    userId INT REFERENCES users(id),
    data JSONB NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Conclusion
This design allows users to create and modify scenes locally before persisting changes to the database, providing a responsive and user-friendly experience.