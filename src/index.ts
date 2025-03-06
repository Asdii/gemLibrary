import {
    ViewerApp,
    AssetManagerPlugin,
    timeout,
    SSRPlugin,
    mobileAndTabletCheck,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSAOPlugin,
    GroundPlugin,
    FrameFadePlugin,
    DiamondPlugin,
    // DepthOfFieldPlugin,
    BufferGeometry,
    MeshStandardMaterial2,
    BloomPlugin, 
    TemporalAAPlugin, 
    RandomizedDirectionalLightPlugin, 
    AssetImporter, 
    Color, 
    Mesh,
    ITexture,
    IMaterial,
    DepthOfFieldPlugin,
    VariationConfiguratorPlugin,
    Texture,
    ISceneObject,
    PresetGroup,
    BackgroundPresetGroup,
    EnvironmentPresetGroup,
    LoadingScreenPlugin
} from "webgi"
import "./styles.css";

async function setupViewer(){

    let model = await document.getElementById("selectedModel")!
    let material = await document.getElementById("materialSelect")!
    let imageScrollContainer = await document.getElementById("imageScrollContainer")!
    let designInfoCard = await document.getElementById("info-container")
    let nameDisplay = await document.getElementById("nombre")
    let sobreAutorDisplay = await document.getElementById("sobreAutor")
    let facetasDisplay = await document.getElementById("facetas")
    let riDisplay = await document.getElementById("ri")
    let indexDisplay = await document.getElementById("index")
    let lwDisplay = await document.getElementById("lw")
    let pwDisplay = await document.getElementById("pw")
    let cwDisplay = await document.getElementById("cw")

    // Initialize the viewer
    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement
    const viewer = new ViewerApp({
        canvas,
        useGBufferDepth: true,
        isAntialiased: false
    })

    viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1)

    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const loadingScreen = await viewer.addPlugin(new LoadingScreenPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    // Add WEBGi plugins
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(true))
    const ssr = await viewer.addPlugin(SSRPlugin)
    const ssao = await viewer.addPlugin(SSAOPlugin)
    await viewer.addPlugin(FrameFadePlugin)
    const bloom = await viewer.addPlugin(BloomPlugin)
    await viewer.addPlugin(TemporalAAPlugin,)
    const diamondPlugin = await viewer.addPlugin(DiamondPlugin)
    //const dof = await viewer.addPlugin(DepthOfFieldPlugin)
    await viewer.addPlugin(RandomizedDirectionalLightPlugin, false)

    ssr!.passes.ssr.passObject.lowQualityFrames = 0
    bloom.pass!.passObject.bloomIterations = 2
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4

    viewer.renderer.refreshPipeline()

    loadingScreen.logoImage = "./assets/logo.png"
    loadingScreen.showOnFilesLoading = true
    loadingScreen.minimizeOnSceneObjectLoad = true
    loadingScreen.hideOnSceneObjectLoad = true
    loadingScreen.showFileNames = false
    loadingScreen.loadingTextHeader = "Cargando..."

    const preset = new EnvironmentPresetGroup()
    viewer.scene.fixedEnvMapDirection = true
    
    // First import the env map
    const diamondEnvMap = await viewer.getManager()!.importer!.importSinglePath<ITexture&Texture>('https://demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr')
    diamondPlugin.envMap = diamondEnvMap!

    // if a separate envMap is specified it is also possible to set the envMapRotation
    diamondPlugin.envMapRotation = Math.PI / 2.0

    let currentMaterial = ""
    let currentModel = ""

    await imageScrollContainer.addEventListener("click", async (event) => {
        currentModel = model.textContent!
        await viewer.scene.disposeSceneModels()
        if(currentMaterial && currentModel){
            let currentModelNumber = currentModel.match(".*? ")![0]
            let currentModelName = currentModel.replace(currentModelNumber, "")
            let currentModelNameFiltered   = currentModel.replace(currentModelNumber, "").replaceAll(" ", "_").replaceAll(".", "")
            let innerModelName     = currentModelNumber.replace(" ", "_").replace(".", "") + currentModelNameFiltered

            designInfoCard.classList.remove('minimized')
            const diseño = [...new Set(filteredData.filter(item => item.nombre === currentModel))][0];
            nameDisplay!.innerText = currentModelName
            sobreAutorDisplay!.innerText = diseño["autor_info"]
            facetasDisplay!.innerText = diseño["facets"]
            riDisplay!.innerText = diseño["angles_for_ri"]
            indexDisplay!.innerText = diseño["index"]
            lwDisplay!.innerText = diseño["l/w"]
            pwDisplay!.innerText = diseño["p/w"]
            cwDisplay!.innerText = diseño["c/w"]

            await viewer.load("https://raw.githubusercontent.com/Asdii/gemList/main/gems/"+currentModel+".glb")
            await makeDiam(innerModelName, currentMaterial);
        } 
    })

    await material.addEventListener("change", async (event) => {
        currentMaterial = await event.target!.selectedOptions[0].textContent
        await viewer.scene.disposeSceneModels()
        if(currentMaterial && currentModel){
            let currentModelNumber = currentModel.match(".*? ")![0]
            let currentModelName   = currentModel.replace(currentModelNumber, "").replaceAll(" ", "_").replaceAll(".", "")
            let innerModelName     = currentModelNumber.replace(" ", "_").replace(".", "") + currentModelName
            await viewer.load("https://raw.githubusercontent.com/Asdii/gemList/main/gems/"+currentModel+".glb")
            await makeDiam(innerModelName, currentMaterial);
        } 
    })

    async function makeDiam(modelName: string, materialName:any){
        const o = await viewer.scene.findObjectsByName(modelName)[0];

        //let refractiveIndex = materials[material]._ri
        const selectedMaterial = materials.find(material => material._name === materialName);
        const riValue = selectedMaterial._ri;
        const colorValue = selectedMaterial._color;
        const dispersionValue = selectedMaterial._dispersion * 0.1;

        await diamondPlugin.makeDiamond(
            <IMaterial<any>>o.material,
            {normalMapRes: 256, cacheKey: o.name.split('_')[0].split('-')[1]},
            {isDiamond: true, color: colorValue, refractiveIndex: riValue, dispersion:dispersionValue, envMapIntensity:2, reflectivity:0.2}
        )
    }
    await viewer.setBackgroundMap("./assets/je_gray_02_4k.hdr");
    await viewer.setEnvironmentMap("./assets/je_gray_02_4k.hdr");
    viewer.scene.backgroundIntensity = 10
}

setupViewer()