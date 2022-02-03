export const Shaders = ()=>{
    const vertex = `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>;
                @location(1) vColor: vec4<f32>;
            };
            @stage(vertex)
            fn main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
                var output : VertexOutput;
                var pos:array<vec2<f32>, 3> = array<vec2<f32>, 3>(
                    vec2<f32>(0.0, 0.5),
                    vec2<f32>(-0.5, -0.5),
                    vec2<f32>(0.5, -0.5));

                var color:array<vec3<f32>, 3> = array<vec3<f32>, 3>(
                        vec3<f32>(1.0, 0.0, 0.0),
                        vec3<f32>(0.0, 1.0, 0.0),
                        vec3<f32>(0.0, 0.0, 1.0));     
                    
                 output.vColor = vec4<f32>(color[VertexIndex], 1.0);
                 output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
                return output;
            }
    `;

    const fragment = `
            @stage(fragment)
            fn main(@location(1) vColor: vec4<f32>) -> @location(0) vec4<f32>{
               return vColor;
            }
    `;
    return {vertex, fragment}
}