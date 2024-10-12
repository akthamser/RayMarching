#version 330 core

uniform vec2 u_resolution;
uniform float u_time;

out vec4 FragColor;

float pixel_size; 


float sdfSphere(vec3 p){
    return length(p) - 1;
}

float map(vec3 p){     
    vec3 camerapos = vec3(0,0,-2.*u_time);
    p = p+camerapos;

    vec3 spherepos = vec3(3*sin(9*u_time),0,0); 
    float sphere1 = sdfSphere(p-spherepos);
    float sphere2 = sdfSphere(p);
    return max(sphere1,sphere2);
}


void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(0,0,-3);
    vec3 rd = normalize(vec3(uv*0.5,1));
    vec3 col = vec3(0);

    float t = 0;

    for(int i=0;i<80;i++){

        vec3 p = ro + rd * t;

        float d = map(p);
        
        t += d;
    if(d < .001) break;
    if(t >  100.) break;
        
    }

    col = vec3(t/10);

    FragColor = vec4(col, 1.0);   
}