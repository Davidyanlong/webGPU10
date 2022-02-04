import { InitGPU,CreateGPUBuffer } from './helper';
import { Shaders } from './shader';

let requestId:any = null

const CreateSquare = async ()=>{
       const {device, context, presentationFormat} = await InitGPU()

       const vertexData = new Float32Array([
         -0.5, -0.5,    // a
         0.5, -0.5,     // b
         -0.5, 0.5,     // d
         -0.5, 0.5,     // d
         0.5, -0.5,     // b
         0.5, 0.5,      // c
       ])

       const colorData = new Float32Array([
         1, 0, 0,    // a red
         0, 1, 0,    // b green
         1, 1, 0,    // d yellow
         1, 1, 0,    // d yellow
         0, 1, 0,    // b green
         0, 0, 1     // c blue
       ])

      const vertexBuffer = CreateGPUBuffer(device, vertexData)
      const colorBuffer = CreateGPUBuffer(device, colorData)

      const shader = Shaders();
      const pipeline = device.createRenderPipeline({
        vertex: {
          module: device.createShaderModule({
            code: shader.vertex,
          }),
          entryPoint: 'main',
          buffers:[
            {
              arrayStride:8,
              attributes:[{
                shaderLocation:0,
                format:"float32x2",
                offset:0
              }]
            },
            {
              arrayStride:12,
              attributes:[{
                shaderLocation:1,
                format:"float32x3",
                offset:0
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
        passEncoder.setVertexBuffer(1, colorBuffer)

        passEncoder.draw(6)
        passEncoder.endPass();
    
        device.queue.submit([commandEncoder.finish()]);
        // requestId =  requestAnimationFrame(frame);
      }
    
      requestId = requestAnimationFrame(frame);
    
}


CreateSquare()
