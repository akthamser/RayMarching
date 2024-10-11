/// This shader is inspired by evilryu https://www.shadertoy.com/view/MdXSWn

#version 330 core

uniform vec2 u_resolution;
uniform float u_time;

out vec4 FragColor;

float pixel_size; 


float map(vec3 p){      
    return length(p) - 1;
}

void main() {
    
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;


    vec3 ro = vec3(0,0,-3);
    vec3 rd = normalize(vec3(uv,1));
    vec3 col = vec3(0);

    float t = 0;


    for(int i=0;i<80;i++){

        vec3 p = ro + rd * t;

        float d = map(p);
        
        t += d;
        
    }
    

    col = vec3(t/5);

    FragColor = vec4(col, 1.0);   
}