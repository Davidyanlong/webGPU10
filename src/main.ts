import { InitGPU,CreateGPUBuffer } from './helper';
import { Shaders } from './shader';

let requestId:any = null

const CreateSquare = async ()=>{
       const {device, context, presentationFormat} = await InitGPU()

       const vertexData = new Float32Array([
         // position      color
         -0.5, -0.5,   1, 0, 0,    // a red 
         0.5, -0.5,    0, 1, 0,    // b green
         -0.5, 0.5,    1, 1, 0,    // d yellow 
         -0.5, 0.5,    1, 1, 0,    // d yellow 
         0.5, -0.5,    0, 1, 0,    // b green 
         0.5, 0.5,     0, 0, 1     // c blue 
       ])

      const vertexBuffer = CreateGPUBuffer(device, vertexData)

      const shader = Shaders();
      const pipeline = device.createRenderPipeline({
        vertex: {
          module: device.createShaderModule({
            code: shader.vertex,
          }),
          entryPoint: 'main',
          buffers:[
            {
              arrayStride: 4*(2+3),
              attributes:[{
                shaderLocation:0,
                format:"float32x2",
                offset:0
              },
              {
                shaderLocation:1,
                format:"float32x3",
                offset:8
              }]
            },
          ]
        },
        fragment: {
          module: device.createShaderModule({
            code: shader.fragment,
          }),
          entryPoint: 'main',
          targets: [
            {
              format: presentationFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });
      // if(requestId!==null) cancelAnimationFrame(requestId)
      function frame() {
        // Sample is no longer the active page.
    
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
    
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
              storeOp: 'store',  // 储存模式
            },
          ],
        };
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline)
        passEncoder.setVertexBuffer(0, vertexBuffer)

        passEncoder.draw(6)
        passEncoder.endPass();
    
        device.queue.submit([commandEncoder.finish()]);
        // requestId =  requestAnimationFrame(frame);
      }
    
      requestId = requestAnimationFrame(frame);
    
}


CreateSquare()
