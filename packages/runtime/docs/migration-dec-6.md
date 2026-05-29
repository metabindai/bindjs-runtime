# Metabind Migration Guide

This document outlines breaking changes and migration steps for iOS and Backend teams.

## iOS Runtime Migration: ComposeJSRuntime → BindJSRuntime

### Overview
The runtime has been renamed from `ComposeJSRuntime` to `BindJSRuntime` with new method signatures for component interaction.

### Breaking Changes

#### 1. Runtime Class Rename
```swift
// OLD
let runtime = ComposeJSRuntime()

// NEW
let runtime = BindJSRuntime()
```

#### 2. Component Calling Method - DEPRECATED
The `call()` method is now deprecated and should be replaced with specific methods:

```swift
// OLD - DEPRECATED
let result = runtime.call("MyComponent", 'body', props)

// NEW - Use specific methods based on your needs
let component = runtime.callComponent("MyComponent", props, children)
let metadata = runtime.getComponentMetadata("MyComponent")
let previews = runtime.getComponentPreviews("MyComponent")
let thumbnail = runtime.getComponentThumbnail("MyComponent")
```

### New API Methods

#### `callComponent(name: String)`
Use this method to execute a component and get its rendered output:

```swift
let runtime = BindJSRuntime()
let componentResult = runtime.callComponent("UserProfile", props, children)
// Returns the component's rendered result
```

#### `getComponentMetadata(name: String)`
Use this method to retrieve component metadata without execution:

```swift
let runtime = BindJSRuntime()
let metadata = runtime.getComponentMetadata("UserProfile")
// Returns component metadata (props, description, etc.)
```

#### `getComponentPreviews(name: String)`
Use this method to get component preview data:

```swift
let runtime = BindJSRuntime()
let previews = runtime.getComponentPreviews("UserProfile")
// Returns preview configurations for the component
```

#### `getComponentThumbnail(name: String)`
Use this method to get component thumbnail data:

```swift
let runtime = BindJSRuntime()
let thumbnail = runtime.getComponentThumbnail("UserProfile")
// Returns thumbnail image or data for the component
```

### Migration Steps for iOS Team

1. **Update Import Statements**
   ```swift
   // Update any imports referencing the old runtime
   import BindJSRuntime // instead of ComposeJSRuntime
   ```

2. **Replace Runtime Initialization**
   ```swift
   // Find all instances of ComposeJSRuntime and replace
   let runtime = BindJSRuntime()
   ```

3. **Update Method Calls**
   - Replace all `call()` method usage with appropriate new methods
   - Consider what data you actually need (component output, metadata, previews, or thumbnails)
   - Use the most specific method for your use case

4. **Test Integration**
   - Verify that component execution still works as expected
   - Test metadata retrieval functionality
   - Validate preview and thumbnail generation

---

## Backend Schema Migration: Component Processing

### Overview
The Metabind CMS Schema now exposes `processComponentTs` method for TypeScript preprocessing before JavaScript compilation.

### New API Method

#### `processComponentTs(componentCode: string): string`
This method should be called before compiling TypeScript components to JavaScript:

```javascript
import { processComponentTs } from '@yapstudios/metabind-cms-schema';

// NEW - Required preprocessing step
const processedCode = processComponentTs(originalComponentCode);
const compiledJs = compileToJs(processedCode);
```

### Key Changes

#### Export Default Conversion
The `processComponentTs` method automatically converts TypeScript `export default` statements to `exports.default` for compatibility:

```typescript
// Input TypeScript
export default function MyComponent() {
  return <div>Hello World</div>;
}

// After processComponentTs()
exports.default = function MyComponent() {
  return <div>Hello World</div>;
};
```

### Migration Steps for Backend Team

**Update Component Processing Pipeline**
   ```javascript
   import { processComponentTs } from '@yapstudios/metabind-cms-schema';

   // OLD - Direct compilation
   function compileComponent(componentTs) {
     return compileToJs(componentTs);
   }
   
   // NEW - With preprocessing
   function compileComponent(componentTs) {
     const processed = processComponentTs(componentTs);
     return compileToJs(processed);
   }
   ```

   ```

### Important Notes

- **Required Step**: `processComponentTs` must be called before any JavaScript compilation
- **Export Conversion**: Automatically handles `export default` → `exports.default` conversion
- **Backward Compatibility**: This is a new requirement for proper component execution
- **Error Handling**: Include proper error handling for preprocessing failures

### Testing Recommendations

1. **Verify Export Conversion**: Test components with various export patterns
2. **Integration Testing**: Ensure the full pipeline (preprocess → compile → execute) works
3. **Error Scenarios**: Test handling of malformed TypeScript code
4. **Performance**: Monitor any performance impact of the additional preprocessing step

---

## Timeline and Support

- **Deprecation Period**: The `call()` method will be supported for 2 more releases
- **Full Migration Required By**: [Insert target date]
- **Support**: Contact the Metabind team for migration assistance

For questions or issues during migration, please reach out to the development team.