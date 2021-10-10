function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("glCanvas");

    // Initialize the GL context
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl");

    const vertexShaderText = `
    precision mediump float;
    attribute vec4 v_position;
    attribute vec2 v_resolution;

    void main() {
      gl_Position = v_position;
    }   
    `;
    const fragmentShaderText = `
    precision mediump float;

    uniform float width;
    uniform float height;

    void main() {
        float normalizedX = gl_FragCoord.x - width;
        float normalizedY = gl_FragCoord.y - height;

        if (sqrt(normalizedX * normalizedX + normalizedY * normalizedY) < 80.0) {
            //transparent cutout
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program!', gl.getProgramInfo(program));
        return;
    }
    // two triangle that covers the whole screen
    var verts = [
        // First triangle:
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0,
        // Second triangle:
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var positionAttribLocation = gl.getAttribLocation(program, 'v_position');
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
        0 * Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.useProgram(program);
    var widthHandle = gl.getUniformLocation(program, "width");
    var heightHandle = gl.getUniformLocation(program, "height");
    gl.uniform1f(widthHandle, window.innerWidth / 2);
    gl.uniform1f(heightHandle, window.innerHeight / 2);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
window.onload = main;

