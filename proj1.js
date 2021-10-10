function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("glCanvas");

    // Initialize the GL context
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

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


    //all arrays in JS is Float64 by default
    var circle = new Array();
    var r = 0.5
    var totalPoints = 100;
    for (i = 0; i < totalPoints; i++) {
        const angle = 2 * Math.PI * i / totalPoints;
        circle.push(
            (0 + r * Math.cos(angle)/(window.innerWidth/800))
        )
        circle.push(
            (0 + r * Math.sin(angle)/(window.innerHeight/800))
        )
    }

    var bacteria = new Array(10);

    for (var i = 0; i < bacteria.length; i++) {
        bacteria[i] = new Array(4);
        bacteria[i][0]=0;//x
        bacteria[i][1]=0;//y
        bacteria[i][2]=0.1;//r
        bacteria[i][3]= new Array();
        updateBacteria(bacteria[i]);
    }

    var triangleVertexBufferObject = gl.createBuffer();
    //set the active buffer to the triangle buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    //gl expecting Float32 Array not Float64
    //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
    //will not change over time)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);


    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    //var colorAttribLocation = gl.getAttribLocation(program,'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
        0 * Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    //gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);
    //////////////////////////////////
    //          math things         //
    //////////////////////////////////

    var motion = new Float32Array(2);

    //get the address of motion variable in the vertex shader
    var motionUniformLocation = gl.getUniformLocation(program, 'motion');

    gl.uniform2fv(motionUniformLocation, motion);

    //////////////////////////////////
    //       Main render loop       //
    //////////////////////////////////

    var x = 0;
    var y = 0;
    var loop = function () {

        motion[0] = x;
        motion[1] = y;

        gl.uniform2fv(motionUniformLocation, motion);

        gl.clearColor(0.5, 0.8, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, totalPoints + 2);



        //call loop function whenever a frame is ready for drawing, usually it is 60fps.
        //Also, if the tab is not focused loop function will not be called
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    //motion[0] = motion[0]-0.001;
    //motion[1] = motion[1]-0.001;


    //gl.drawArrays(gl.POINTS,0,3);
    //gl.drawArrays(gl.LINES,0,3);
    //gl.drawArrays(gl.LINE_STRIP,0,3);
    //gl.drawArrays(gl.LINE_LOOP,0,3);


    canvas.onmousedown = function (ev) {
        var mx = ev.clientX, my = ev.clientY;
        mx = mx / canvas.width - 0.5;
        my = my / canvas.height - 0.5;
        mx = mx * 2;
        my = my * -2;
        console.log(mx + ' ' + my);
        x = mx;
        y = my;
    }


    window.onkeypress = function (event) {
        if (event.key == 'd')
            x = x + 0.005;

        if (event.key == 'a')
            x = x - 0.005;
        if (event.key == 'w')
            y = y + 0.005;

        if (event.key == 's')
            y = y - 0.005;
    }
}

function updateBacteria(bact){
    var totalPoints=100;
    bact[2]+=0.01;
    var raduis=bact[2];
    for (i = 0; i < totalPoints*2; i+=2) {
        const angle = 2 * Math.PI * i / totalPoints;
        bact[3][i]=(
            (0 + raduis * Math.cos(angle)/(window.innerWidth/800))
        )
        bact[3][i+1]=(
            (0 + raduis * Math.sin(angle)/(window.innerHeight/800))
        )
    }
}

var vertexShaderText = `
precision mediump float;

attribute vec2 vertPosition;
uniform vec2 motion;

void main() {
    gl_Position = vec4(vertPosition+motion, 0, 1.0);
	gl_PointSize = 10.0;
}
`;

var fragmentShaderText = `
precision mediump float;

varying vec3 fragColor;

void main(){
    gl_FragColor = vec4(1, 0, 0, 0);
}
`;

window.onload = main;