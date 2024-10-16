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

float sdfSphere(vec3 p){
    return length(p) - 1;
}

float sdfCube(vec3 p , vec3 b){
    
    p = abs(p) - b;
    return length(max(p,0)) + min(max(p.x,max(p.y,p.z)),0);
}
float sdfFruitShape(vec3 p){

    float f = pow(dot(p.xz,p.xz),0.25);
    p.y -= 0.5 * f;
    return length(p) - 1;
}

float sdfTerrain(vec3 p) {
    // Apply FBM to control terrain height
    float height = fbm(p+5*u_time);  // Scaling the XZ plane for smooth terrain
    return p.y - height;  // Terrain height is determined by FBM
}

vec2 map(vec3 p){     
    
    vec3 fruitpos = vec3(0,0,0); 
    vec2 fruit = vec2(sdfFruitShape(p-fruitpos),1);

    float ground = p.y + 0.3;

    if(fruit.x>ground)
        fruit.y = 1;
    else
        fruit.y = 2;

    float terrain = sdfTerrain(p);
    return vec2(terrain, 2);  // Terrain ID 1

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
    for(int i=0;i<1000;i++){

        
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
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(0,2,-4);
    vec3 rd = normalize(vec3(uv*0.5,1));
    vec3 col = vec3(0.8,0.8,1);
    vec3 fcol = vec3(0.8,0.8,1);// bg color
  

    ro.xz *= rot2D(u_time*3);
    rd.yz *= rot2D(0.4);
    rd.xz *= rot2D(u_time*3);


    vec2 inter = intersect(ro,rd);

    vec3 p = ro + inter.x * rd ;
 
    if(inter != vec2(0.0)){
   
    vec3 nor = Normal(p);
    vec3 sundir = normalize(vec3(1,.8,.6));
    vec3 suncolor = vec3(1.0,0.97 , 0.85);
    vec3 skycolor = vec3(0.93,0.8,0.5);
    vec3 bg = exp(uv.y-2.0)*skycolor;
    vec3 bling = normalize(vec3(-sundir.x * 0.8,sundir.y ,-sundir.z * 0.8));
    vec3 ref = reflect(rd, nor);

    float con = .7;
    float sha = softShadow( p, sundir , 0.1 , 1 , 8 );
    float dif =  max(0,dot(nor,sundir));
    float bac =  max(0,0.1 + 0.5*dot(nor,bling));
    float ambient = 0.6 + 0.4 * nor.y;
    float spe = pow(clamp(dot(sundir, ref), 0.0, 1.0), 8.0);
    float rim = pow(1+dot(nor,rd),2.5);

    col = con * skycolor;
    col +=  ambient * skycolor * sha * 0.6;
    col +=  dif * suncolor * sha  ;
    col +=  bac * suncolor;


    col = col*0.3 + 0.7*sqrt(col);
    col*=0.5;


    if(inter.y == 1 ){
        vec3 material = vec3(0.6,0.5,0.3) ;
        float f = fbm(p*vec3(6,0,0.5));

        material = mix(material,vec3(0.3,0.2,.1),f);
        float ao = smoothstep(0.1,1.5,length(p.xz));

        material *= ao;
        col *= material;

    }
    else if(inter.y == 2){
        vec3 material = vec3(0,0.5,1.0);

        material = mix(material,vec3(0.0,.7,.8), smoothstep(0.2,1,fbm(p))) ;
        float f = smoothstep(0.0,1.0,fbm(p*4));
        material *= 0.8 + 0.2*  f;
      //  material = mix(material , vec3(0.9,0.9,0.7) ,smoothstep(0.7,0.9,fbm(p*48)));
       // float ao; //fake ambient occlusion
       // ao = 0.5 + 0.5 * nor.y;
      //  material *= ao;
        col *= material;
        
    }
    col += 0.3 * rim * ambient;
    col += 0.6 * spe * sha *ambient;

    col = col*0.1 + 0.9*sqrt(col);
    col *= vec3(0.9,0.8,0.7);
    }
    vec2 q=gl_FragCoord.xy/u_resolution.xy; 
    
    col*=0.2+0.8*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),1); // vignette

    FragColor = vec4(col, 1.0);   
}