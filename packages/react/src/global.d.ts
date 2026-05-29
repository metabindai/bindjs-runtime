declare module 'Text'

import { ModelViewerElement } from '@google/model-viewer';

declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": ModelViewerElement;
  }
}
