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

       

vec4 wave(vec2 p,vec2 dir,float freq,float time){

    float x = dot(p,dir)*freq + time;
    float res = exp(sin(x)-1);
    float dx = res * cos(x);
    
    float ddx = res * cos(x) * freq * dir.x;
    float ddy = res * cos(x) * freq * dir.y;

    return vec4(res,dx,ddx,ddy);
}

vec4 map(vec3 p){     
    
    float height = 0;

    float amp = 1;
    float freq = 1;
    float n = 0;
    float ampSum = 0;
    float time = 8;
    float ddx = 0;  
    float ddy = 0;

    for(int k = 0 ; k < 32  ; k++){

        vec2 dir = vec2(cos(n),sin(n));
        
        vec4 wave = wave( p.xz , dir , freq , u_time*time );

        p.xz +=  dir * wave.y * amp * 0.4;

        ddx += wave.z * amp;
        ddy += wave.w * amp;

        height += wave.x * amp;

        ampSum += amp;
        amp *= 0.82;
        freq *= 1.18;
    
        n += 13298.693;
        time *= 1.07;
    }

    return vec4(p.y +  height/ampSum,1,ddx/ampSum,ddy/ampSum);
}


vec3 Normal2(vec4 inter) {

   
    vec3 B = vec3(0,-inter.w,1);
    vec3 T = vec3(1,-inter.z,0);
    vec3 crossproduct = cross(B,T);
    return normalize(crossproduct) ;
        
}

vec3 Normal(vec3 p) {
    vec3 e = vec3(0.0001, 0, 0);//epsilon
    vec3 n;
    n.x = map(p + e.xyy).x - map(p - e.xyy).x;
    n.y = map(p + e.yxy).x - map(p - e.yxy).x;
    n.z = map(p + e.yyx).x - map(p - e.yyx).x;
    return normalize(n);
        
}

vec4 intersect(vec3 ro ,vec3 rd){

    float t = 0;
    for(int i=0;i<500;i++){

        
        vec3 p = ro + rd * t;

        vec4 c = map(p);
        float d = c.x;
        
        t += d;
    if(d < .001) return vec4(t,c.yzw);
    if(t >  50.) break;
        
    }
    return vec4(50,-1,-1,-1);
}



void main() {
    vec2 uv = (2 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

    vec3 ro = vec3(0,2,-3);
    vec3 rd = normalize(vec3(uv*0.5,1));

    //rd.yz *= rot2D(0.4 + u_time*0);


    vec3 col = vec3(0.0);

    

    vec4 inter = intersect(ro,rd);
    vec3 p = ro + inter.x * rd;
    vec3 nor = Normal2(inter);
    vec3 ref = normalize(reflect(rd,nor));
    vec3 lightdir = normalize(vec3(0,sin(u_time*0.3)*0.4,1));

    

    if(inter.y != -1){

    vec3 baseColor = vec3(0.0, 0.2, 0.5);  // A blue-turquoise base color



    //Ambient
    vec3 ambient = vec3(0.1,0.1,0.2);

    //Diffuse
    float diffStrength = max(0,dot(lightdir,nor));
    vec3 diffuse = diffStrength*vec3(0.5, 0.7, 1.0);





    col = (ambient + diffuse ) *baseColor;

    col = pow(col,vec3(1/1.8));

    //Speculer
    float speculerStrength =  pow(max(0,dot(ref,lightdir)),64);
    vec3 speculer = speculerStrength * vec3(1.5,1.5,1.5);    
   
    //Fresnel Effect
    float fresnel = pow(1.0 - max(dot(-rd, nor), 0.0), 5.0);

    col+= speculer * fresnel;

    vec3 fresnelEffect = mix(col, vec3(.9, .9, 1.0), fresnel);  // Blend with light blue for a reflective effect
    col = fresnelEffect;


    // Fog
    float b = 0.05;
    float fogAmount = 1.0 - exp(-inter.x*b);
    col = mix(col,vec3(.8,.8,.9),fogAmount);
   
    // 



    }
    else{

      float height = rd.y;
      vec3 skyTop = vec3(0.5, 0.6, 0.8);
      vec3 skyBottom = vec3(0.8, 0.8, 0.9);
      float maxSkyHeight = 35;
      vec3 skyColor = mix(skyBottom, skyTop, p.y / maxSkyHeight);

      float sun = max(0,dot(rd,lightdir));
      vec3 sunColor = smoothstep(0.998,0.9998,max(0,dot(rd,lightdir))) *  vec3(1,.9,.7) ;
      col = skyColor + sunColor;

    }

   

    vec2 q=gl_FragCoord.xy/u_resolution.xy; 

    col*=0.2+0.8*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),.71);  // vignette

    FragColor = vec4(col, 1.0);   
}