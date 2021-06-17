import { OpenStreetMapProvider } from 'leaflet-geosearch';

const lat = -32.943044;
const lng = -60.661592;

const map = L.map('mapa').setView([lat, lng], 15);

let markers = new L.FeatureGroup().addTo(map);
let marker;

document.addEventListener('DOMContentLoaded', ()=> {
   
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);

});

function buscarDireccion(e){
    if(e.target.value.length > 5){

        // Utilizar el provider
        const provider = new OpenStreetMapProvider();
        provider.search({query: e.target.value}).then((resultado) => {

            // Si existe un pin anterior limpiarlo
            markers.clearLayers();

            // Utilizar el provider y geocoder
            const geocodeService = L.esri.Geocoding.geocodeService();

            // Mostrar el mapa según la búsqueda

            map.setView((resultado[0].bounds[0]), 15);

            // Agregar el pin en el mapa

            marker = new L.marker(resultado[0].bounds[0], {
                draggable: true,
                autoPan: true
            })
            .addTo(map)
            .bindPopup(resultado[0].label)
            .openPopup();

            // Detectar movimiento del marker
            marker.on('moveend', function(e){
                marker = e.target;
                const posicion = marker.getLatLng();
                map.panTo(new L.LatLng(posicion.lat, posicion.lng));
            });

            // Asignar al contenedor de markers
            markers.addLayer(marker);

        });
    }
}
