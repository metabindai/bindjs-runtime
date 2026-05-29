# MetabindUI Package

This package contains the core rendering components for the Metabind Composer.

## Type Definitions

This package exports TypeScript type definitions for the MetabindUI API:

- Located in `types/metabind.d.ts`
- Defines the component API, modifiers, and data types
- Used by the editor package for Monaco IntelliSense
- Can be imported by other packages to ensure type safety

### Modifying Type Definitions

To update or add new type definitions:

1. Edit `types/metabind.d.ts` with your changes
2. Ensure the changes match the actual implementation in the code
3. Run the build for the editor package (`pnpm run build --filter editor`) to regenerate its loadTypeDefinitions.ts file

## API Structure

The type definitions follow the SwiftUI-inspired API structure:
- Component interface with chainable modifiers
- Color, Shape, and other specialized components
- Layout components (HStack, VStack, etc.)
- State management (Binding, State)