import React, { useEffect, useRef } from 'react';
import { useStyle } from '../Style';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useInView } from '../Utils/useInView';
import { useAnimationNode } from '../AnimatableStyle';
interface ShaderProps {
    children?: React.ReactNode;
    sizeThatFits?: (props: ShaderProps) => { width: number, height: number };
    fragmentShader?: string;
    uniforms?: Record<string, number | number[] | boolean>; // Support for various uniform types
    timeEnabled?: boolean; // Whether to pass time automatically (default: true)
    mouseEnabled?: boolean; // Whether to track mouse position (default: false)
    updateInterval?: number; // FPS (0 = static, 1-60 = target FPS, undefined = requestAnimationFrame)
}

const DEFAULT_FRAGMENT_SHADER = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;

    #define PI 3.14159265359

    // Function to create a smooth plasma effect
    float plasma(vec2 position, float scale, float time, vec2 mouseEffect) {
      float v1 = sin(position.x * scale + time);
      float v2 = sin(position.y * scale + time * 0.7);
      float v3 = sin((position.x + position.y) * scale + time * 1.3);
      float v4 = sin(sqrt(position.x * position.x + position.y * position.y) * scale + time * 1.5);
      
      // Add mouse-based ripple effect
      float mouseDistance = length(position - mouseEffect) * 10.0;
      float mouseRipple = sin(mouseDistance - time * 3.0) * exp(-mouseDistance * 0.2);
      
      return (v1 + v2 + v3 + v4 + mouseRipple) * 0.2 + 0.5;
    }

    vec3 hsvToRgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 position = uv * 2.0 - 1.0;
      position.x *= resolution.x / resolution.y; // Correct aspect ratio
      
      // Create mouse effect - normalized position with smooth transition
      vec2 mousePos = mouse * 2.0 - 1.0;
      mousePos.x *= resolution.x / resolution.y;
      
      // Calculate plasma value
      float scale = 8.0 + sin(time * 0.2) * 2.0; // Dynamic scaling
      float plasmaValue = plasma(position, scale, time, mousePos);
      
      // Create dynamic color palette based on time and plasma value
      float hue = fract(plasmaValue * 0.9 + time * 0.1);
      float saturation = 0.7 + sin(time * 0.3) * 0.2;
      float brightness = 0.8 + plasmaValue * 0.2;
      
      // Convert HSV to RGB
      vec3 color = hsvToRgb(vec3(hue, saturation, brightness));
      
      // Add subtle vignette effect
      float vignette = 1.0 - smoothstep(0.5, 1.4, length(position));
      color *= vignette;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

function Shader(props: ShaderProps): React.ReactNode {
    const currentStyle = { ...useStyle() };

    const layout = useLayout(props, Shader);

    const { ref, inView } = useInView<HTMLDivElement>({
        rootMargin: "0px"
    });

    // Get animation node - pass inView ref so animation uses same element
    const { style: animationStyle } = useAnimationNode(ref as React.RefObject<HTMLElement>);

    const inViewRef = useRef(inView);
    inViewRef.current = inView;
    const canvasRef = useShaderCanvas(props, inViewRef);

    const style: React.CSSProperties = {
        ...currentStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
        overflow: 'hidden',

        ...layoutStyle(layout),

        // Apply animation styles
        ...animationStyle,
    };

    return (
        <div style={style} ref={ref}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block', // Prevent inline spacing issues
                    objectFit: 'cover'  // Ensure the canvas covers the container fully
                }}
            />
        </div>
    );
}

function useShaderCanvas(props: ShaderProps, inViewRef: React.MutableRefObject<boolean>) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size to match container - with improved resizing logic
        const resizeCanvas = () => {
            if (canvas) {
                const rect = canvas.parentElement?.getBoundingClientRect();
                if (!rect) return;

                const width = rect.width || canvas.clientWidth;
                const height = rect.height || canvas.clientHeight;

                // Set display size (css pixels)
                Object.assign(canvas.style, {
                    width: '100%',
                    height: '100%',
                });

                // Set actual size in memory (scaled for high-DPI devices)
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
            }
        };

        // Initial size setup
        resizeCanvas();

        // Try to get WebGL 2.0 context first, fall back to WebGL 1.0 if not available
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Check if we're using WebGL 2.0
        const isWebGL2 = gl instanceof WebGL2RenderingContext;
        console.log(`Using WebGL ${isWebGL2 ? '2.0' : '1.0'}`);

        // Different shader header based on WebGL version
        const shaderVersionHeader = isWebGL2
            ? "#version 300 es\n"
            : "";

        // Create appropriate vertex shader based on WebGL version
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        if (isWebGL2) {
            // WebGL 2.0 vertex shader with 'in' instead of 'attribute'
            gl.shaderSource(vertexShader, `#version 300 es
        in vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `);
        } else {
            // WebGL 1.0 vertex shader
            gl.shaderSource(vertexShader, `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `);
        }
        gl.compileShader(vertexShader);

        // Create fragment shader with appropriate header
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;

        // Add WebGL 2.0 header and output declaration if needed
        let shaderCode = props.fragmentShader || DEFAULT_FRAGMENT_SHADER;

        if (isWebGL2) {
            // Add WebGL 2.0 header
            // For WebGL 2.0, we need to modify the shader to use 'in' instead of 'varying'
            // and declare an output variable for the fragment color
            shaderCode = `#version 300 es
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        out vec4 fragColor;
        
        ${
                // Strip precision and uniform declarations if they exist in the original shader
                // since we've already declared them in the header
                shaderCode
                    .replace(/precision\s+\w+\s+float\s*;/g, '')
                    .replace(/uniform\s+float\s+time\s*;/g, '')
                    .replace(/uniform\s+vec2\s+resolution\s*;/g, '')
                    .replace(/uniform\s+vec2\s+mouse\s*;/g, '')
                    // Replace gl_FragColor with fragColor for WebGL 2.0
                    .replace(/gl_FragColor/g, 'fragColor')
                }
      `;
        }

        gl.shaderSource(fragmentShader, shaderCode);
        gl.compileShader(fragmentShader);

        // Check if shaders compiled successfully
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
            gl.deleteShader(vertexShader);
            return;
        }

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
            gl.deleteShader(fragmentShader);
            return;
        }

        // Create shader program
        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking failed:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Create a rectangle filling the canvas
        const vertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Setup attributes
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Additional logging for shader info
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            let debugSource = gl.getShaderSource(fragmentShader);
            console.log('Fragment shader source that failed:', debugSource);
        }

        // Setup built-in uniforms
        const timeLocation = gl.getUniformLocation(program, 'time');
        const resolutionLocation = gl.getUniformLocation(program, 'resolution');
        const mouseLocation = gl.getUniformLocation(program, 'mouse');

        // Setup custom uniforms
        const uniformLocations: Record<string, WebGLUniformLocation | null> = {};
        if (props.uniforms) {
            Object.keys(props.uniforms).forEach(name => {
                uniformLocations[name] = gl.getUniformLocation(program, name);
            });
        }

        // Set up mouse tracking if enabled
        let mouseX = 0;
        let mouseY = 0;

        // Define the mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y to match WebGL coordinates
        };

        // Add mouse tracking listener if enabled
        // Always enable mouse tracking for the default shader, unless explicitly disabled
        const enableMouse = props.mouseEnabled !== false || props.fragmentShader === undefined;
        if (enableMouse) {
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        // Animation loop
        let startTime = Date.now();
        let animationFrame: number;
        let intervalId: number | undefined;
        const isStatic = props.updateInterval === 0;
        const useCustomInterval = props.updateInterval && props.updateInterval > 0;

        // Consolidated scheduling function
        const scheduleNextRender = () => {
            if (isStatic) return;
            if (useCustomInterval) {
                // Use setTimeout for custom FPS (convert FPS to milliseconds)
                const intervalMs = 1000 / props.updateInterval!;
                intervalId = window.setTimeout(render, intervalMs);
            } else {
                // Use requestAnimationFrame for maximum refresh rate
                animationFrame = requestAnimationFrame(render);
            }
        };

        const render = () => {
            if (!gl) return;
            if (!inViewRef.current) {
                // Out of view - schedule next frame to check visibility but skip rendering
                scheduleNextRender();
                return;
            }

            // Update time uniform if enabled (default: true)
            if (props.timeEnabled !== false) {
                const currentTime = isStatic ? 0 : (Date.now() - startTime) / 1000;
                if (timeLocation) {
                    gl.uniform1f(timeLocation, currentTime);
                }
            }

            // Update resolution uniform
            if (resolutionLocation) {
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            }

            // Update mouse uniform if enabled or using default shader
            const useMouseForShader = props.mouseEnabled !== false || props.fragmentShader === undefined;
            if (useMouseForShader && mouseLocation) {
                gl.uniform2f(mouseLocation, mouseX, mouseY);
            }

            // Update custom uniforms
            if (props.uniforms) {
                Object.entries(props.uniforms).forEach(([name, value]) => {
                    const location = uniformLocations[name];
                    if (location) {
                        if (typeof value === 'number') {
                            gl.uniform1f(location, value);
                        } else if (typeof value === 'boolean') {
                            gl.uniform1i(location, value ? 1 : 0);
                        } else if (Array.isArray(value)) {
                            // Handle array uniforms based on length
                            switch (value.length) {
                                case 2:
                                    gl.uniform2f(location, value[0], value[1]);
                                    break;
                                case 3:
                                    gl.uniform3f(location, value[0], value[1], value[2]);
                                    break;
                                case 4:
                                    gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                                    break;
                                default:
                                    console.warn(`Unsupported uniform array length: ${value.length} for ${name}`);
                            }
                        }
                    }
                });
            }

            // Draw the rectangle
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Schedule next render
            scheduleNextRender();
        };

        render();

        // Observe parent container for size changes using ResizeObserver
        const parentElement = canvas.parentElement;
        let resizeObserver: ResizeObserver | undefined;
        if (parentElement) {
            resizeObserver = new ResizeObserver(() => {
                resizeCanvas();
            });
            resizeObserver.observe(parentElement);
        }

        // Cleanup
        return () => {
            resizeObserver?.disconnect();
            const useMouseForShader = props.mouseEnabled !== false || props.fragmentShader === undefined;
            if (useMouseForShader) {
                canvas.removeEventListener('mousemove', handleMouseMove as any);
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            if (intervalId) {
                clearTimeout(intervalId);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(buffer);
        };
    }, [props.fragmentShader, props.uniforms, props.timeEnabled, props.mouseEnabled, props.updateInterval]);

    return canvasRef;
}

// Size calculation function
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    Shader,
    sizeThatFits
);

export { Shader };
