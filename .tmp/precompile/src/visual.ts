
module powerbi.extensibility.visual.ol3Viz22678BC03BE3C4E71AEB1B2FED56B6238  {


    declare var require: any
    declare var map: any;

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;    
        private visualData = null;   
        private wmsLayers = [];


        constructor(options: VisualConstructorOptions) {
             
            this.target = options.element;
            const mapDiv: HTMLElement = document.createElement("div");
            mapDiv.id = "map";                 
            this.target.appendChild(mapDiv);

            let styleEle = document.createElement("link");
            styleEle.rel = "stylesheet";
            styleEle.href = "https://js.arcgis.com/3.23/esri/css/esri.css";

            document.getElementsByTagName('head')[0].appendChild(styleEle);
            let _self =this;
            let script = document.createElement("script");
            script.type = 'text/javascript';
            script.src = "https://js.arcgis.com/3.23/";
            script.onload = () => {               
                require(["esri/basemaps", "esri/layers/ArcGISTiledMapServiceLayer", "esri/map", "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
                    "esri/config", "esri/tasks/ProjectParameters", "esri/geometry/Point", "esri/SpatialReference",
                    "esri/geometry/Extent", "esri/layers/WMSLayer", "esri/layers/WMSLayerInfo", "dojo/domReady!"],
                    function (esriBasemaps, ArcGISTiledMapServiceLayer, Map, WMTSLayer, WMTSLayerInfo, TileInfo, esriConfig, ProjectParameters, Point, SpatialReference,
                        Extent, WMSLayer, WMSLayerInfo) {
                        esriConfig.defaults.io.corsEnabledServers.push({
                            host: "aws-gs-app-dev-01.azurewebsites.net",
                            withCredentials: false
                        },
                            {
                                host: "tiles.arcgis.com",
                                withCredentials: false
                            });
                        map = new Map(mapDiv, {
                            center: new Point(545015.910699392, 181761.390298464, new SpatialReference({ "wkid": 27700 })),
                            zoom: 14
                        });

                        var tiled = new ArcGISTiledMapServiceLayer("//tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/OS_Open_Raster/MapServer");
                        map.addLayer(tiled);

                        console.log("adding", _self.visualData);
                        _self.loadMapLayers(_self.visualData);

                        map.on("loadx", function () {

                            var layers: any[] = [
                                { name: 'grosight:SEWER_CATCH_AREAS', label: 'Sewer Catchment Area' },
                                { name: 'grosight:SEWER_PIPE', label: 'Sewer Pipe' },
                                { name: 'grosight:SEWER_MANHOLE', label: 'Manhole' }
                            ];

                            for (var x = 0; x < layers.length; x++) {
                                var layer = layers[x];
                                var wmsLayer = new WMSLayer("//aws-gs-app-dev-01.azurewebsites.net/geoserver", {
                                    format: "png",
                                    resourceInfo: {
                                      copyright: "GeoServer",
                                      description: "Anglian Water",
                                      extent: new Extent(622673.59,-5527547.26,622676.72,-5527544.98, {wkid: 27700}),
                                      spatialReference: "EPSG:900913",
                                      featureInfoFormat: "text/html",
                                      getMapURL: "//aws-gs-app-dev-01.azurewebsites.net/geoserver/ows",
                                      getFeatureInfoURL:"//aws-gs-app-dev-01.azurewebsites.net/geoserver/ows",
                                      layerInfos: [
                                        new WMSLayerInfo({
                                          name: layer.name,
                                          title: layer.label,
                                          queryable: true,
                                          showPopup: true
                                        })
                                      ],
                                      spatialReferences: [3857,4236,190013],
                                      version: "1.0.0"
                                    },
                                    version: "1.0.0",
                                    visibleLayers: [
                                      layer.name
                                    ]
                                  });
                                  map.addLayer(wmsLayer);                               
                                  
                            }
                           

                            

                            // for (var x = 0; x < layers.length; x++) {
                            //     var layer = layers[x];
                            //     var layerInfo = new WMTSLayerInfo({
                            //         identifier:layer.name,
                            //         tileMatrixSet: "EPSG:900913",
                            //         format: "png"
                            //     });
                            //     var options = {
                            //         serviceMode: "KVP",
                            //         layerInfo: layerInfo
                            //     };

                            //     var wmtsLayer = new WMTSLayer("https://aws-gs-app-dev-01.azurewebsites.net/geoserver/gwc/service/wmts", options);
                            //     map.addLayer(wmtsLayer);
                            // }

                        });

                    });
            }
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        public update(options: VisualUpdateOptions) {
            if(options.dataViews && options.dataViews[0].table){
                this.visualData = options.dataViews[0].table;
                this.loadMapLayers(options.dataViews[0].table);
            }
        }

        loadMapLayers(tableData){       
            var layerIds =  map.layerIds;   
            console.log( layerIds);
            layerIds.forEach((layerid, index) => {
                console.log(index);
                if(index > 0){
                    var layer =  map.getLayer(layerid);     
                    if(layer){
                        console.log(layer);
                        map.removeLayer(layer);
                    }    
                    
                }
            });
            this.wmsLayers= [];
            tableData.rows.forEach((row) => {               
                require(["esri/geometry/Extent", "esri/layers/WMSLayer", "esri/layers/WMSLayerInfo"],
                    function ( Extent , WMSLayer, WMSLayerInfo) {
                        
                        var wmsLayer = new WMSLayer(row[0], {                            
                            format: "png",
                            resourceInfo: {
                              copyright: "GeoServer",
                              description: "Anglian Water",
                              extent: new Extent(622673.59,-5527547.26,622676.72,-5527544.98, {wkid: 27700}),
                              spatialReference: "EPSG:900913",
                              featureInfoFormat: "text/html",
                              getMapURL: row[0] + "/ows",
                              layerInfos: [
                                new WMSLayerInfo({
                                  name: row[1],
                                  title: row[1],
                                  queryable: true,
                                  showPopup: true
                                })
                              ],
                              spatialReferences: [3857,4236,190013],
                              version: "1.0.0"
                            },
                            version: "1.0.0",
                            visibleLayers: [
                                row[1]
                            ]
                          });
                         map.addLayer(wmsLayer);

                         this.wmsLayers.push(wmsLayer);
                          console.log("layer added");
                    });
            });
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}