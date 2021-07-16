import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';


// Obtener los valores de la base de datos
const lat = document.querySelector('#lat').value || -32.943044;
const lng = document.querySelector('#lng').value || -60.661592;
const direccion = document.querySelector('#direccion').value || '';

const geocodeService = L.esri.Geocoding.geocodeService();

const map = L.map('mapa').setView([lat, lng], 15);

let markers = new L.FeatureGroup().addTo(map);
let marker;

// Colocar el pin en Edición

if(lat && lng){

    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup();

    // Detectar movimiento del marker
    marker.on('moveend', function(e){
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng));
        // Reverse geocoding

        geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
            
            // Asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel).openPopup();
            llenarImputs(result);


        });
    });

    // Asignar al contenedor de markers
    markers.addLayer(marker);
}

document.addEventListener('DOMContentLoaded', ()=> {
   
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    const buscador = document.querySelector('#formbuscador');
    buscador.addEventListener('input', buscarDireccion);

});

function buscarDireccion(e){
    if(e.target.value.length > 5){

        // Utilizar el provider y GeoCoder
        
        
        const provider = new OpenStreetMapProvider();
        provider.search({query: e.target.value}).then((resultado) => {

            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result){
                llenarImputs(result);

                // Si existe un pin anterior limpiarlo
                markers.clearLayers();

                // Utilizar el provider y geocoder

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
                    // Reverse geocoding

                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
                        
                        // Asigna los valores al popup del marker
                        marker.bindPopup(result.address.LongLabel).openPopup();
                        llenarImputs(result);


                    });
                });

                // Asignar al contenedor de markers
                markers.addLayer(marker);
            })

        });
    }
}


function llenarImputs(resultado){
    document.querySelector("#direccion").value = resultado.address.Address || '';
    document.querySelector("#ciudad").value = resultado.address.City || '';
    document.querySelector("#estado").value = resultado.address.Region || '';
    document.querySelector("#pais").value = resultado.address.CountryCode || '';
    document.querySelector("#lat").value = resultado.latlng.lat || '';
    document.querySelector("#lng").value = resultado.latlng.lng || '';
}