export const CreateGPUBuffer = (device:GPUDevice, data:Float32Array,
    usageFlag:GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST)=>{
    const buffer = device.createBuffer({
        size:data.byteLength,
        usage:usageFlag,
        mappedAtCreation:true   // 设置为true 可以通过getMappedRange 获取GPU中的缓存
    })

    new Float32Array(buffer.getMappedRange()).set(data)
    // 更改为unmap状态 GPU才可以使用
    buffer.unmap()
    return buffer
}

export const InitGPU = async ()=>{
    const checkGPU = CheckWebGPU()
    if(checkGPU.includes('not support WebGPU')){
        console.log(checkGPU)
        throw('not support WebGPU')
    }
    const canvas = document.querySelector('#canvas-webgpu') as HTMLCanvasElement;
    
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter
    let device = await adapter?.requestDevice() as GPUDevice

    device.lost.then((info) => {
        console.error(`WebGPU device was lost: ${info.message}`);
        // @ts-ignore
        device = null;

        // Many causes for lost devices are transient, so applications should try getting a
        // new device once a previous one has been lost unless the loss was caused by the
        // application intentionally destroying the device. Note that any WebGPU resources
        // created with the previous device (buffers, textures, etc) will need to be
        // re-created with the new one.
        if (info.reason != 'destroyed') {
            InitGPU();
        }
    });
    
    const context = canvas.getContext('webgpu')as unknown  as GPUCanvasContext
  
    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const presentationFormat = context.getPreferredFormat(adapter);

    
    context.configure({
        device,
        format: presentationFormat,
        size: presentationSize,
      });

    return {device, canvas, context, presentationFormat}
}

export const CheckWebGPU = () => {
    let result = 'Great, your current browser supports WebGPU!';
        if (!navigator.gpu) {
           result = `Your current browser does not support WebGPU! Make sure you are on a system 
                     with WebGPU enabled. Currently, SPIR-WebGPU is only supported in  
                     <a href="https://www.google.com/chrome/canary/">Chrome canary</a>
                     with the flag "enable-unsafe-webgpu" enabled. See the 
                     <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status"> 
                     Implementation Status</a> page for more details.                   
                    `;
        } 
    return result;
}