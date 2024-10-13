#version 330 core

uniform vec2 u_resolution;
uniform float u_time;

out vec4 FragColor;

float pixel_size; 



//------------------Util---------------------------------
mat2 rot2D(float angle){
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c,-s,s,c);
}
//---------------OP--------------------------------------

float opUnion( float d1, float d2 )
{
    return min(d1,d2);
}

float opSubtraction( float d1, float d2 )
{
    return max(-d1,d2);
}

float opIntersection( float d1, float d2 )
{
    return max(d1,d2);
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = max(k-abs(d1-d2),0.0);
    return min(d1, d2) - h*h*0.25/k;
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    return -opSmoothUnion(d1,-d2,k);
    
    //float h = max(k-abs(-d1-d2),0.0);
    //return max(-d1, d2) + h*h*0.25/k;
}

float opSmoothIntersection( float d1, float d2, float k )
{
    return -opSmoothUnion(-d1,-d2,k);

    //float h = max(k-abs(d1-d2),0.0);
    //return max(d1, d2) + h*h*0.25/k;
}


//------------SDFs---------------------------------

float sdfSphere(vec3 p){
    return length(p) - 1;
}

float sdfCube(vec3 p , vec3 b){
    
    p = abs(p) - b;
    return length(max(p,0)) + min(max(p.x,max(p.y,p.z)),0);
}


float map(vec3 p){     

    vec3 camerapos = vec3(0,0,0);
    //camerapos.xz *= rot2D(u_time);
    p = p + camerapos;
  //  p += vec3(min(u_time,2),0,0);
    
    vec3 q= fract(p) -.5;
  //q.xz *= rot2D(u_time);
    vec3 spherepos = vec3(0,0,0); 
    float sphere = sdfSphere((p-spherepos));
    vec3 cubepos = vec3(0,0,0); 
    float cube = sdfCube((q - cubepos ) ,vec3(0.2));

    float ground = p.y + 1;

    return opSmoothUnion(cube,sphere,1);
}



void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(0,0,-3);
    vec3 rd = normalize(vec3(uv*0.5,1));
    vec3 col = vec3(0);
    
    float t = 0;

    rd.xz *= rot2D(u_time);

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