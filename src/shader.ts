export const Shaders = ()=>{
    const vertex = `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>;
                @location(1) vColor: vec4<f32>;
            };

            @stage(vertex)
            fn main(@location(0) pos:vec4<f32>,
                    @location(1) color:vec4<f32>) -> VertexOutput{   
                var output : VertexOutput;      
                output.Position = pos;
                output.vColor = color;
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