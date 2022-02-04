import { InitGPU,CreateGPUBuffer,CreateGPUBufferUnit,CreateTransforms,CreateViewProjection } from './helper';
import { Shaders } from './shader';
import { 
  cubeVertexArray,
  cubeVertexSize,
  cubePositionOffset,
  cubeColorOffset,
  cubeUVOffset,
  cubeVertexCount 
} from './vertex_data'
import { mat4} from 'gl-matrix'

let requestId:any = null

const CreateSquare = async ()=>{
       const {device, context, presentationFormat,canvas} = await InitGPU()

       const vertexData = cubeVertexArray()

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
              arrayStride: cubeVertexSize,
              attributes:[{
                shaderLocation:0,
                format:"float32x4",
                offset:cubePositionOffset
              },
              {
                shaderLocation:1,
                format:"float32x4",
                offset: cubeColorOffset
              },
              {
                shaderLocation:2,
                format:"float32x2",
                offset: cubeUVOffset
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
          cullMode:"back"   // 优化性能
        },
        depthStencil:{
          format:"depth24plus",
          depthWriteEnabled:true,
          depthCompare:"less"
        }
      });
      // if(requestId!==null) cancelAnimationFrame(requestId)
      function frame() {
        // Sample is no longer the active page.
        
        const modelMatrix = mat4.create()
        const mvpMatrix = mat4.create()
        const vp = CreateViewProjection(canvas.clientWidth/ canvas.clientHeight)
        const vpMatrix = vp.viewProjectionMatrix

        const uniformBuffer = device.createBuffer({
          size:64,
          usage:GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        const uniformBindGroup = device.createBindGroup({
          layout:pipeline.getBindGroupLayout(0),
          entries:[
            {
              binding:0,
              resource:{
                buffer:uniformBuffer,
                offset:0,
                size:64
              }
            }
          ]
        })
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const depthTexture = device.createTexture({
          size:[canvas.clientWidth * window.devicePixelRatio, canvas.clientHeight * window.devicePixelRatio, 1],
          format:"depth24plus",
          usage:GPUTextureUsage.RENDER_ATTACHMENT
        })

    
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
              storeOp: 'store',  // 储存模式
            },
          ],
          depthStencilAttachment:{
            view:depthTexture.createView(),
            depthLoadValue:1.0,
            depthStoreOp:'store',
            stencilLoadValue:0,
            stencilStoreOp:'store'
          }
        };

        CreateTransforms(modelMatrix)
        mat4.multiply(mvpMatrix,vpMatrix,modelMatrix)
        device.queue.writeBuffer(uniformBuffer,0,mvpMatrix as ArrayBuffer)
    
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline)
        passEncoder.setVertexBuffer(0, vertexBuffer)
        passEncoder.setBindGroup(0,uniformBindGroup)
        
        passEncoder.draw(cubeVertexCount)
        passEncoder.endPass();
    
        device.queue.submit([commandEncoder.finish()]);
        // requestId =  requestAnimationFrame(frame);
      }
    
      requestId = requestAnimationFrame(frame);
    
}


CreateSquare()
