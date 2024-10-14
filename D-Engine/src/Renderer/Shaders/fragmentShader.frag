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


vec2 map(vec3 p){     

    vec3 camerapos = vec3(0,0,0);
    p = p + camerapos;
    vec3 q = fract(p) - vec3(0.5,0.5,0.5);
    
    vec3 spherepos = vec3(0,0,0); 
    vec2 sphere = vec2(sdfSphere(q*4-spherepos)/4,1);
    vec3 cubepos = vec3(0,0,0); 
    vec2 cube = vec2(sdfCube((p - cubepos ) ,vec3(0.5)),1);

    float ground = p.y + 1;
    if(min(sphere.x,ground)==ground)
        sphere.y = 0;
    else
        sphere.y = 1;
    return vec2(min(sphere.x,ground),sphere.y);

    }
float softShadow(vec3 ro , vec3 rd,float mint,float maxt,float k){

    float res = 1.0;
    float t = mint;
    for(int i = 0; i < 256*2 && t < maxt ;i++ )
    {
        float h = map(ro + rd*t).x;
        if(h < .001) return 0.2;
        
        res = min (res,max(k*h/t,0.2));
        t += h;
    }
    return res;

} 

vec3 Normal(vec3 p) {
    vec3 e = vec3(0.001, 0.0, 0.0);//epsilon
    vec3 n;
    n.x = map(p + e.xyy).x - map(p - e.xyy).x;
    n.y = map(p + e.yxy).x - map(p - e.yxy).x;
    n.z = map(p + e.yyx).x - map(p - e.yyx).x;
    return normalize(n);
        
}

vec2 intersect(vec3 ro ,vec3 rd){

    float t = 0;
    for(int i=0;i<800;i++){

        
        vec3 p = ro + rd * t;

        vec2 c = map(p);
        float d = c.x;
        
        t += d;
    if(d < .001) return vec2(t,c.y);
    if(t >  1000.) break;
        
    }
    return vec2(0.0);
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(1,2,-3);
    vec3 rd = normalize(vec3(uv*0.5,1));
    vec3 col = vec3(1,1,1);
    vec3 fcol = vec3(0.8,0.8,1);// bg color
  

   //ro.xz *= rot2D(u_time*10);
    rd.yz *= rot2D(sin(-10));

    vec2 inter = intersect(ro,rd);

    if(inter != vec2(0.0)){
    col = mix(vec3(1,1,1),vec3(1,1,1),inter.y);
    vec3 p = ro + inter.x * rd ;
    vec3 nor = Normal(p);
    vec3 sundir = normalize(vec3(1,.8,.6));

    float con = 1.0;
    float sha = softShadow( p, sundir , 0.1 , 1 , 8 );
    float dif =  max(0,dot(nor,sundir));
    float ambient = 0.5 + 0.5 * nor.y;

    col = con * vec3(0.1,0.15,0.2);
    col +=  ambient*vec3(0.1,0.15,0.2) * 0.1;
    col +=  dif * vec3(1,0.97,0.85) * sha  ;

    col =sqrt(col);
    col*=0.6;

    }



    FragColor = vec4(col, 1.0);   
}