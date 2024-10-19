#version 330 core

uniform vec2 u_resolution;
uniform float u_time;

out vec4 FragColor;

float pixel_size; 

//-------------------Noise-------------------------------
float whiteNoise(float n){
    return fract(sin(n) * 43758.5453);
}

float valueNoise(vec3 x){
 vec3 p = floor(x);
 vec3 k = fract(x);
 k=k*k*(3.0-2.0*k);
 float n = p.x + 37.*p.y + 113. *p.z;

 float a = whiteNoise(n);
 float b = whiteNoise(n + 1);
 float c = whiteNoise(n + 37);
 float d = whiteNoise(n + 38);
 float e = whiteNoise(n + 113);
 float f = whiteNoise(n + 114);
 float g = whiteNoise(n + 150);
 float h = whiteNoise(n + 151);


 float res = mix( mix(mix(a,b,k.x),mix(c,d,k.x),k.y),
                  mix(mix(e,f,k.x),mix(g,h,k.x),k.y),   
                  k.z
                 );

 return res;
}


float fbm(vec3 p) {
    p=p*0.4;
    float f = 0.0;
    float amplitude = 0.8;  
    float totalAmplitude = 0.0;  

    for (int i = 0; i < 8; i++) {
        f += amplitude * valueNoise(p);  
        totalAmplitude += amplitude;     
        p *= 2.0 + .1 * i ;            
        amplitude *= 0.5;                
    }

    return f / totalAmplitude;   // Normalize by the total amplitude
}

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

             
}
vec2 map(vec3 p){     
    
    float height = 0;

    float s = 1;
    float t = 1;
    float n = 0;
    float sum = 0;
    float time = 9;

    for(int k = 0 ; k < 32  ; k++){

    vec2 dir = vec2(cos(n),sin(n));
    float x = dot(p.xz,dir)*t + u_time *time;
    height +=  exp(sin(x)-1) *s;

 
    sum += s;
    s = mix (s,0,0.25);
    t *= 1.18;
    
    n += 1232.399963;
    time *= 1.07;
    }

    return vec2(p.y - height/sum -2,1);
}
float softShadow(vec3 ro , vec3 rd,float mint,float maxt,float k){

    float res = 1.0;
    float t = mint;
    for(int i = 0; i < 256 && t < maxt ;i++ )
    {
        float h = map(ro + rd*t).x;
        if(h < .001) return 0.2;
        
        res = min (res,max(k*h/t,0.2));
        t += h;
    }
    return res;

} 

vec3 Normal(vec3 p) {
    vec3 e = vec3(0.1, 0, 0);//epsilon
    vec3 n;
    n.x = map(p + e.xyy).x - map(p - e.xyy).x;
    n.y = map(p + e.yxy).x - map(p - e.yxy).x;
    n.z = map(p + e.yyx).x - map(p - e.yyx).x;
    return normalize(n);
        
}

vec2 intersect(vec3 ro ,vec3 rd){

    float t = 0;
    for(int i=0;i<500;i++){

        
        vec3 p = ro + rd * t;

        vec2 c = map(p);
        float d = c.x;
        
        t += d;
    if(d < .001) return vec2(t,c.y);
    if(t >  50.) break;
        
    }
    return vec2(0.0);
}

void main() {
    vec2 uv = (2 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(0,3,-3);
    vec3 rd = normalize(vec3(uv*0.5,1));

    rd.yz *= rot2D(0.4);


    vec3 col = vec3(0.0);

    

    vec2 inter = intersect(ro,rd);

    

    if(inter != vec2(0.0)){
    
    vec3 p = ro + inter.x * rd;
    vec3 nor = Normal(p);
    vec3 lightdir = normalize(vec3(sin(u_time),1,cos(u_time)));

    float diff = max(0,dot(lightdir,nor));
    float sha = softShadow( p, lightdir , .1 , 10 , 0.5);
    col = inter.y == 1 ? vec3(0,0,1) : vec3(0,1,0);
    
    col *= diff + 0.1;
    }
  

    FragColor = vec4(col, 1.0);   
}